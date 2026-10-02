import { requirementTerms } from "@/lib/analyze";
import { containsPhrase, findPostingSkills, skillAppearsIn, SKILLS } from "@/lib/skills";
import type { ParsedResume } from "@/lib/types";

export type JobScoreParts = {
  keywords: number;
  domain: number;
  technologies: number;
  experience: number;
};

export type JobFit = {
  score: number;
  parts: JobScoreParts;
};

const DOMAIN_IDS = new Set([
  "ai",
  "machine-learning",
  "deep-learning",
  "neural-networks",
  "llm",
  "nlp",
  "generative-ai",
  "diffusion-models",
  "reinforcement-learning",
  "computer-vision",
  "object-detection",
  "small-object-detection",
  "semantic-segmentation",
  "image-classification",
  "ocr",
  "super-resolution",
  "hyperspectral-imaging",
  "vision-language-models",
  "experimental-design",
  "ablation-studies",
  "healthcare-document-parsing",
  "medical-coding",
  "federated-learning",
  "differential-privacy",
  "model-evaluation",
  "fine-tuning",
  "prompt-engineering",
  "embeddings",
]);

const EXTRA_DOMAIN = [
  "research",
  "healthcare",
  "remote sensing",
  "data science",
  "robotics",
  "medical imaging",
  "geospatial",
  "satellite imagery",
  "earth observation",
  "clinical",
  "radiology",
  "bioinformatics",
];

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

function share(hit: number, total: number): number {
  if (total <= 0) return 50;
  return Math.round((100 * hit) / total);
}

function experienceBlob(resume: ParsedResume): string {
  const parts: string[] = [];
  const seen = new Set<string>();
  for (const section of resume.sections) {
    if (section.kind !== "experience") continue;
    parts.push(section.title, section.text, ...section.bullets);
    for (const roleId of section.roleIds) seen.add(roleId);
  }
  for (const role of resume.roles) {
    if (!seen.has(role.id)) continue;
    parts.push(role.title, role.orgPlain, ...role.bullets);
  }
  return parts.join("\n");
}

function keywordScore(posting: string, resumeText: string): number {
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
  return share(hit, total);
}

function domainScore(posting: string, experience: string): number {
  let total = 0;
  let hit = 0;
  const seen = new Set<string>();
  for (const skill of SKILLS) {
    if (!DOMAIN_IDS.has(skill.id)) continue;
    const inPosting =
      skill.aliases.some((alias) => containsPhrase(posting, alias)) ||
      (skill.caseAliases?.some((alias) => containsPhrase(posting, alias)) ?? false);
    if (!inPosting || seen.has(skill.label.toLowerCase())) continue;
    seen.add(skill.label.toLowerCase());
    total += 1;
    const found = { id: skill.id, label: skill.label, category: skill.category, source: "catalog" as const };
    if (skillAppearsIn(found, experience)) hit += 1;
  }
  for (const phrase of EXTRA_DOMAIN) {
    if (seen.has(phrase) || !containsPhrase(posting, phrase)) continue;
    seen.add(phrase);
    total += 1;
    if (containsPhrase(experience, phrase)) hit += 1;
  }
  return share(hit, total);
}

function technologyScore(posting: string, resumeText: string): number {
  const tools = findPostingSkills(posting).filter((skill) => !DOMAIN_IDS.has(skill.id));
  if (tools.length === 0) return 50;
  const hit = tools.filter((skill) => skillAppearsIn(skill, resumeText)).length;
  return share(hit, tools.length);
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

function yearsAsked(posting: string): number | null {
  const years: number[] = [];
  for (const match of posting.matchAll(/(\d+)\s*(?:-|to)\s*(\d+)\s*\+?\s*years?\b/gi)) {
    years.push(Number(match[1]));
  }
  const withoutRanges = posting.replace(/\d+\s*(?:-|to)\s*\d+\s*\+?\s*years?\b/gi, " ");
  for (const match of withoutRanges.matchAll(/\b(\d+)\s*\+?\s*years?\b/gi)) {
    years.push(Number(match[1]));
  }
  if (years.length > 0) return Math.max(...years);
  const seniority: number[] = [];
  if (/\b(intern(?:ship)?|new grad|entry[- ]level|junior)\b/i.test(posting)) seniority.push(1);
  if (/\bmid[- ]level\b/i.test(posting)) seniority.push(4);
  if (/\bsenior\b/i.test(posting)) seniority.push(6);
  if (/\bstaff\b/i.test(posting)) seniority.push(8);
  if (/\b(principal|director)\b/i.test(posting)) seniority.push(12);
  if (seniority.length === 0) return null;
  return Math.max(...seniority);
}

function experienceScore(posting: string, resume: ParsedResume): number {
  const asked = yearsAsked(posting);
  if (asked === null) return 50;
  const have = resumeYears(resume, new Date());
  const distance = Math.abs(asked - have);
  if (distance <= 2) return 100;
  const asksForMore = asked > have;
  const rate = asksForMore ? 15 : 8;
  return Math.max(0, Math.round(100 - (distance - 2) * rate));
}

export function scoreJobFit(posting: string, resume: ParsedResume): JobFit {
  const experience = experienceBlob(resume);
  const parts: JobScoreParts = {
    keywords: keywordScore(posting, resume.plainText),
    domain: domainScore(posting, experience),
    technologies: technologyScore(posting, resume.plainText),
    experience: experienceScore(posting, resume),
  };
  const score = Math.round((parts.keywords + parts.domain + parts.technologies + parts.experience) / 4);
  return { score, parts };
}
