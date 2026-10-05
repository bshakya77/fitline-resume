import { requirementTerms } from "@/lib/analyze";
import { containsPhrase, findPostingSkills, skillAppearsIn } from "@/lib/skills";
import type { ParsedResume } from "@/lib/types";

export type DegreeLevel = "bachelor" | "master" | "phd";

export type JobScoreParts = {
  keywordsHit: number;
  keywordsTotal: number;
  /** Degree the posting requires. Null when it names none. */
  education: DegreeLevel | null;
  /** Years the posting asks for. Null when it names none. */
  experienceYears: number | null;
};

const DEGREE_LABEL: Record<DegreeLevel, string> = {
  bachelor: "Bachelor",
  master: "Masters",
  phd: "Ph.D.",
};

const DEGREE_RANK: Record<DegreeLevel, number> = {
  bachelor: 1,
  master: 2,
  phd: 3,
};

const DEGREE_PATTERNS: { level: DegreeLevel; pattern: RegExp }[] = [
  { level: "phd", pattern: /\b(?:ph\.?\s*d\.?|d\.?\s*phil\.?|doctorate|doctoral)\b/i },
  {
    level: "master",
    pattern: /\b(?:master(?:'s|’s)(?:\s+degree)?|masters(?:\s+degree)?|master\s+of|m\.s\.?|m\.sc\.?|msc|mba|m\.eng\.?|\bms\b)\b/i,
  },
  {
    level: "bachelor",
    pattern: /\b(?:bachelor(?:'s|’s)(?:\s+degree)?|bachelors(?:\s+degree)?|bachelor\s+of|b\.s\.?|b\.sc\.?|b\.a\.?|b\.eng\.?|\bbs\b)\b/i,
  },
];

export type JobFit = {
  score: number;
  parts: JobScoreParts;
};

const MONTHS: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

function keywordCounts(posting: string, resumeText: string): { hit: number; total: number } {
  const seen = new Set<string>();
  let total = 0;
  let hit = 0;
  for (const skill of findPostingSkills(posting)) {
    const key = skill.label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    total += 1;
    if (skillAppearsIn(skill, resumeText)) hit += 1;
  }
  for (const word of requirementTerms(posting)) {
    if (seen.has(word)) continue;
    seen.add(word);
    total += 1;
    if (containsPhrase(resumeText, word)) hit += 1;
  }
  return { hit, total };
}

function levelsIn(text: string): DegreeLevel[] {
  return DEGREE_PATTERNS.filter(({ pattern }) => pattern.test(text)).map(({ level }) => level);
}

function lowest(levels: DegreeLevel[]): DegreeLevel | null {
  if (!levels.length) return null;
  return levels.reduce((min, level) => (DEGREE_RANK[level] < DEGREE_RANK[min] ? level : min));
}

function highest(levels: DegreeLevel[]): DegreeLevel | null {
  if (!levels.length) return null;
  return levels.reduce((max, level) => (DEGREE_RANK[level] > DEGREE_RANK[max] ? level : max));
}

const DEGREE_CONTEXT =
  /\b(?:degree|degrees|education|equivalent|qualifications?|diploma|required|preferred|minimum)\b/i;

function countsAsEducation(sentence: string): boolean {
  if (!levelsIn(sentence).length) return false;
  if (DEGREE_CONTEXT.test(sentence)) return true;
  if (/\b(?:bachelor|bachelors|master(?:'s|’s)|masters|master\s+of)\b/i.test(sentence)) return true;
  return /\b(?:ph\.?\s*d\.?|m\.s\.?|m\.sc\.?|b\.s\.?|b\.a\.?|b\.sc\.?|bs|ms|mba|msc)\s+in\b/i.test(sentence);
}

function sentences(text: string): string[] {
  const shielded = text.replace(/\b(?:ph\.d|d\.phil|m\.s|m\.sc|m\.eng|b\.s|b\.sc|b\.a|b\.eng)\./gi, (token) =>
    token.replace(/\./g, ""),
  );
  return shielded.split(/(?<=[.!?;])\s+|\n+/);
}

function educationRequired(posting: string): DegreeLevel | null {
  const required: DegreeLevel[] = [];
  const mentioned: DegreeLevel[] = [];
  for (const sentence of sentences(posting)) {
    if (!countsAsEducation(sentence)) continue;
    const levels = levelsIn(sentence);
    mentioned.push(...levels);
    const preferred = /\bprefer(?:red|ence)?\b/i.test(sentence);
    const explicit = /\brequired\b/i.test(sentence);
    if (!preferred || explicit) required.push(...levels);
  }
  return lowest(required.length ? required : mentioned);
}

function resumeDegree(resume: ParsedResume): DegreeLevel | null {
  const fromSections = resume.sections
    .filter((section) => section.kind === "education")
    .map((section) => `${section.text} ${section.bullets.join(" ")}`)
    .join(" ");
  const fromRoles = resume.roles
    .filter((role) => /education/i.test(role.sectionTitle))
    .map((role) => `${role.title} ${role.orgPlain} ${role.bullets.join(" ")}`)
    .join(" ");
  const blob = `${fromSections} ${fromRoles}`.trim() || resume.plainText;
  return highest(levelsIn(blob));
}

function parseMonthYear(value: string): { year: number; month: number } | null {
  const match = /([A-Za-z]+)\s+(\d{4})/.exec(value.trim());
  if (!match) return null;
  const month = MONTHS[match[1].toLowerCase()];
  if (month === undefined) return null;
  return { year: Number(match[2]), month };
}

function resumeYears(resume: ParsedResume, now: Date): number {
  const experienceIds = new Set(
    resume.sections.filter((section) => section.kind === "experience").flatMap((section) => section.roleIds),
  );
  let months = 0;
  for (const role of resume.roles) {
    if (!experienceIds.has(role.id)) continue;
    const parts = role.dates.split(/\s*[–—-]\s*/);
    if (parts.length < 2) continue;
    const start = parseMonthYear(parts[0]);
    const endToken = parts[parts.length - 1].trim();
    const end = /present|current|now/i.test(endToken)
      ? { year: now.getFullYear(), month: now.getMonth() }
      : parseMonthYear(endToken);
    if (!start || !end) continue;
    const span = (end.year - start.year) * 12 + (end.month - start.month);
    if (span > 0) months += span;
  }
  return months / 12;
}

function yearsIn(text: string): number[] {
  const years: number[] = [];
  for (const match of text.matchAll(/(\d+)\s*(?:-|to)\s*(\d+)\s*\+?\s*years?\b/gi)) {
    years.push(Number(match[1]));
  }
  const withoutRanges = text.replace(/\d+\s*(?:-|to)\s*\d+\s*\+?\s*years?\b/gi, " ");
  for (const match of withoutRanges.matchAll(/\b(\d+)\s*\+?\s*years?\b/gi)) {
    years.push(Number(match[1]));
  }
  return years;
}

function yearsAsked(posting: string): number | null {
  const required: number[] = [];
  const mentioned: number[] = [];
  for (const sentence of sentences(posting)) {
    const years = yearsIn(sentence);
    if (!years.length) continue;
    mentioned.push(...years);
    const preferred = /\bprefer(?:red|ence)?\b/i.test(sentence);
    const explicit = /\brequired\b/i.test(sentence);
    if (!preferred || explicit) required.push(...years);
  }
  const pool = required.length ? required : mentioned;
  if (!pool.length) return null;
  return Math.min(...pool);
}

function keywordPercent(hit: number, total: number): number {
  if (total <= 0) return 100;
  return Math.round((100 * hit) / total);
}

function educationPercent(required: DegreeLevel | null, have: DegreeLevel | null): number {
  if (required === null) return 100;
  if (have === null) return 0;
  return DEGREE_RANK[have] >= DEGREE_RANK[required] ? 100 : 0;
}

function experiencePercent(asked: number | null, have: number): number {
  if (asked === null || asked <= 0) return 100;
  if (have >= asked) return 100;
  return Math.round((100 * have) / asked);
}

export function educationText(level: DegreeLevel | null): string {
  return level ? DEGREE_LABEL[level] : "Not specified";
}

export function experienceText(years: number | null): string {
  if (years === null) return "Not specified";
  return years === 1 ? "1 year" : `${years} years`;
}

export function scoreJobFit(posting: string, resume: ParsedResume): JobFit {
  const keywords = keywordCounts(posting, resume.plainText);
  const education = educationRequired(posting);
  const experienceYears = yearsAsked(posting);
  const parts: JobScoreParts = {
    keywordsHit: keywords.hit,
    keywordsTotal: keywords.total,
    education,
    experienceYears,
  };
  const pieces: number[] = [];
  if (keywords.total > 0) pieces.push(keywordPercent(keywords.hit, keywords.total));
  if (education !== null) pieces.push(educationPercent(education, resumeDegree(resume)));
  if (experienceYears !== null) {
    pieces.push(experiencePercent(experienceYears, resumeYears(resume, new Date())));
  }
  const score = pieces.length
    ? Math.round(pieces.reduce((sum, value) => sum + value, 0) / pieces.length)
    : 0;
  return { score, parts };
}
