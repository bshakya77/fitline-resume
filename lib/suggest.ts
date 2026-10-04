import type { FoundSkill, ResumeRole, SkillCategory } from "@/lib/types";

const CATEGORY_TERMS: Record<SkillCategory, string[]> = {
  vision: ["vision", "detection", "image", "yolo", "satellite", "opencv", "segmentation", "imagery"],
  deployment: ["deploy", "docker", "edge", "tensorrt", "onnx", "jetson", "linux", "kubernetes", "container"],
  research: ["research", "experiment", "benchmark", "paper", "evaluation"],
  ml: ["pytorch", "tensorflow", "model", "learning", "neural", "training", "inference"],
  backend: ["api", "backend", "c#", ".net", "rest", "blazor", "microservice"],
  sql: ["sql", "postgres", "mysql", "database", "stored procedure"],
  healthcare: ["healthcare", "health", "parsing", "clinical", "patient", "xml"],
  data: ["etl", "pipeline", "warehouse", "spark"],
  general: [],
};

function roleBlob(role: ResumeRole): string {
  return `${role.title} ${role.orgPlain} ${role.dates} ${role.bullets.join(" ")}`.toLowerCase();
}

export function isResearchRole(role: ResumeRole): boolean {
  return /research|scientist/i.test(role.title) || /research/i.test(role.sectionTitle);
}

export function isVerisk(role: ResumeRole): boolean {
  return /verisk/i.test(`${role.orgPlain} ${role.title}`);
}

export function isUsOrNepal(role: ResumeRole): boolean {
  if (isVerisk(role)) return false;
  return /united states/i.test(role.orgPlain) || /^nepal\b/i.test(role.orgPlain.trim());
}

function yearsIn(dates: string): number[] {
  return [...dates.matchAll(/\d{4}/g)].map((match) => Number(match[0]));
}

function recency(role: ResumeRole): number {
  const dates = role.dates.toLowerCase();
  const years = yearsIn(dates);
  const latest = years.length ? Math.max(...years) : 0;
  if (/present|current/.test(dates)) return 100000 + latest;
  return latest;
}

export function mostRecentRole(roles: ResumeRole[]): ResumeRole {
  return [...roles].sort((a, b) => recency(b) - recency(a) || a.order - b.order)[0];
}

function preferredRoles(skill: FoundSkill, roles: ResumeRole[]): { roles: ResumeRole[]; routed: boolean } {
  if (skill.category === "healthcare") {
    const matches = roles.filter(isVerisk);
    if (matches.length) return { roles: matches, routed: true };
  }
  if (
    skill.category === "vision" ||
    skill.category === "deployment" ||
    skill.category === "research" ||
    skill.category === "ml"
  ) {
    const matches = roles.filter(isResearchRole);
    if (matches.length) return { roles: matches, routed: true };
  }
  if (skill.category === "backend" || skill.category === "sql" || skill.category === "data") {
    const matches = roles.filter(isUsOrNepal);
    if (matches.length) return { roles: matches, routed: true };
  }
  return { roles, routed: false };
}

export function scoreRole(skill: FoundSkill, role: ResumeRole): number {
  const blob = roleBlob(role);
  let score = 0;
  for (const term of CATEGORY_TERMS[skill.category]) {
    if (blob.includes(term)) score += 2;
  }
  for (const word of skill.label.toLowerCase().split(/[^a-z0-9+#]+/)) {
    if (word.length > 3 && blob.includes(word)) score += 3;
  }
  if (skill.category === "healthcare" && isVerisk(role)) score += 5;
  if ((skill.category === "backend" || skill.category === "sql" || skill.category === "data") && isUsOrNepal(role)) {
    score += 3;
  }
  if (
    (skill.category === "vision" ||
      skill.category === "deployment" ||
      skill.category === "ml" ||
      skill.category === "research") &&
    isResearchRole(role)
  ) {
    score += 3;
  }
  return score;
}

function roleWhere(role: ResumeRole): string {
  return role.orgPlain ? `${role.title} at ${role.orgPlain}` : role.title;
}

export function assessFit(
  skill: FoundSkill,
  role: ResumeRole,
  roles: ResumeRole[],
  mode: "auto" | "manual",
): { fit: "close" | "weak"; fitNote: string } {
  const pref = preferredRoles(skill, roles);
  const score = scoreRole(skill, role);
  const onPreferred = pref.routed && pref.roles.some((item) => item.id === role.id);
  const close = onPreferred ? skill.category !== "general" || score > 0 : score >= 3;
  const where = roleWhere(role);
  if (!close) {
    const fitNote =
      mode === "auto"
        ? `Weak fit. Nothing in the resume is close to ${skill.label}, so this defaults to ${where}. Move it if another role is a better home.`
        : `Weak fit. ${skill.label} does not line up with the work in ${where}. Pick another role if you have a closer one.`;
    return { fit: "weak", fitNote };
  }
  return {
    fit: "close",
    fitNote: `Closest role: ${where}. The sentence stays tied to work this role already describes.`,
  };
}

export function chooseRole(
  skill: FoundSkill,
  roles: ResumeRole[],
): { role: ResumeRole; fit: "close" | "weak"; fitNote: string } {
  const pref = preferredRoles(skill, roles);
  const pool = pref.routed ? pref.roles : roles;
  const ranked = [...pool].sort(
    (a, b) => scoreRole(skill, b) - scoreRole(skill, a) || recency(b) - recency(a) || a.order - b.order,
  );
  const best = ranked[0] ?? mostRecentRole(roles);
  const placement = assessFit(skill, best, roles, "auto");
  if (!pref.routed && scoreRole(skill, best) < 3) {
    const fallback = mostRecentRole(roles);
    return { role: fallback, ...assessFit(skill, fallback, roles, "auto") };
  }
  return { role: best, ...placement };
}

type SkillShape = "model" | "practice" | "infra" | "service" | "store" | "domain";

type UsedPhrases = {
  works: Set<string>;
  closings: Set<string>;
  verbs: Set<string>;
  sentences: Set<string>;
};

type WorkFact = {
  work: string;
  closing: string;
  statedResult: boolean;
};

const VERBS: Record<SkillShape, string[]> = {
  model: ["Fine-tuned", "Evaluated", "Adapted", "Compared", "Trained", "Benchmarked"],
  practice: ["Applied", "Incorporated", "Documented", "Used", "Retrieved", "Grounded"],
  infra: ["Deployed", "Scheduled", "Containerized", "Hosted", "Ran", "Exported"],
  service: ["Rebuilt", "Extended", "Served", "Connected", "Exposed"],
  store: ["Queried", "Indexed", "Stored", "Moved"],
  domain: ["Parsed", "Checked", "Reviewed", "Mapped"],
};

const LEAD_VERBS: Record<string, string> = {
  analyzed: "analyzing",
  architected: "architecting",
  benchmarked: "benchmarking",
  built: "building",
  covered: "covering",
  delivered: "delivering",
  deployed: "deploying",
  developed: "developing",
  improved: "improving",
  launched: "launching",
  led: "leading",
  maintained: "maintaining",
  optimized: "optimizing",
  reduced: "reducing",
  shipped: "shipping",
  supported: "supporting",
};

function skillShape(skill: FoundSkill): SkillShape {
  const label = skill.label.toLowerCase();
  if (skill.category === "deployment") return "infra";
  if (skill.category === "backend") return "service";
  if (skill.category === "sql") return "store";
  if (skill.category === "healthcare") return "domain";
  if (skill.category === "data") return "store";
  if (/engineering|databases|retrieval|generation/.test(label) || /^(rag|nlp)$/i.test(skill.label)) return "practice";
  if (/pinecone|faiss|weaviate|chroma|vector/.test(label)) return "store";
  if (skill.category === "ml" || skill.category === "vision" || skill.category === "research") return "model";
  return "practice";
}

function escapeReg(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countMentions(sentence: string, label: string): number {
  const re = new RegExp(`(^|[^A-Za-z0-9])${escapeReg(label)}(?=[^A-Za-z0-9]|$)`, "gi");
  return [...sentence.matchAll(re)].length;
}

function cleanClause(text: string): string {
  let value = text.replace(/\([^)]*\)/g, " ");
  const open = value.indexOf("(");
  if (open >= 0) value = value.slice(0, open);
  return value
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/\s+\./g, ".")
    .replace(/^[,;:\s]+|[,;:\s]+$/g, "")
    .trim();
}

function clausesOf(bullet: string): string[] {
  const plain = bullet.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ");
  return plain
    .split(/;\s+|(?<=[.!?])\s+|,\s+so\s+|,\s+then\s+|,\s+and\s+(?=showed\b)|,\s+(?=(?:guiding|including|covering|connecting)\b)/i)
    .map(cleanClause)
    .filter((part) => part.length > 28 && !part.includes(")"));
}

function statesResult(part: string): boolean {
  return /(?:\d+(?:\.\d+)?\s*%|\bmAP@|\bFPS\b|\bF1\b|\d+(?:\.\d+)?\s*MB\b|\bspeedup\b|\d+\+?\s+hours|\d+\+?\s+participants|\bby\s+\d+)/i.test(
    part,
  );
}

function toGerund(phrase: string): string {
  const lead = /^([A-Za-z]+)\b/.exec(phrase);
  if (!lead) return phrase;
  const gerund = LEAD_VERBS[lead[1].toLowerCase()];
  return gerund ? gerund + phrase.slice(lead[1].length) : phrase;
}

function asSentence(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim().replace(/[.]+$/, "").replace(/\s+\./g, ".");
  const sentence = clean.charAt(0).toUpperCase() + clean.slice(1);
  return `${sentence}.`;
}

function closingSentence(clause: string, work: string): string {
  if (/^(delivered|reduced|improved|ran|stayed|cut|led|reached|exceeded|showed)\b/i.test(clause)) {
    const noun = [...work.matchAll(/\b(testbed|pipeline|framework|assessment|deployment|system|platform|module|detection)\b/gi)].at(-1)?.[1];
    const subject = noun ? `That ${noun.toLowerCase()}` : "That work";
    return asSentence(`${subject} ${clause.charAt(0).toLowerCase()}${clause.slice(1)}`);
  }
  if (/^[a-z]+ing\b/.test(clause)) return asSentence(`That work includes ${clause}`);
  return asSentence(clause);
}

function metricPieces(clause: string): string[] {
  const parts = clause.split(/\s+and\s+(?=delivered\b)/i);
  const head = parts[0].trim();
  const subject = head.match(/\b([A-Za-z0-9/+.-]+(?:\s+[A-Za-z0-9/+.-]+){0,6}\s+deployment)\b/i)?.[1];
  const withSubject = parts.length < 2
    ? [clause]
    : [
        head,
        ...parts.slice(1).map((part) => {
          const trimmed = part.trim();
          return subject ? `${subject} ${trimmed.charAt(0).toLowerCase()}${trimmed.slice(1)}` : trimmed;
        }),
      ];
  return withSubject.flatMap((part) => {
    const bits = part
      .split(/,\s+(?:and\s+)?/)
      .map((bit) => bit.trim())
      .filter((bit) => bit.length > 12);
    return bits.length > 1 && bits.every(statesResult) ? bits : [part];
  });
}

function briefResult(clause: string): string {
  const match = clause.match(/\b(?:reduced|improved|cut|exceeded|reached|led|delivered)\b(?:(?!\d).){0,48}\d+(?:\.\d+)?\s*%?/i);
  return (match?.[0] ?? clause).trim();
}

function factsFor(role: ResumeRole): WorkFact[] {
  const facts: WorkFact[] = [];
  for (const bullet of role.bullets) {
    const clauses = clausesOf(bullet);
    const works = clauses.filter((clause) => !statesResult(clause)).map(toGerund);
    const results = clauses.filter(statesResult).flatMap(metricPieces);
    let work = works[0];
    const derivedFromResult = !work || work.length < 24;
    if (derivedFromResult && results[0]) {
      work = toGerund(
        results[0]
          .replace(/\bby\s+\d+(?:\.\d+)?\s*%/gi, "")
          .replace(/\d+(?:\.\d+)?\s*%/g, "")
          .replace(/\s+/g, " ")
          .replace(/\s+,/g, ",")
          .trim(),
      );
    }
    if (!work || work.length < 24) continue;
    const closings = results.length
      ? results.map((result) => ({
          text: closingSentence(derivedFromResult ? briefResult(result) : result, work),
          statedResult: true,
        }))
      : works.slice(1).map((detail) => ({ text: closingSentence(detail, work), statedResult: false }));
    if (closings.length === 0) {
      facts.push({ work, closing: "", statedResult: false });
      continue;
    }
    for (const closing of closings) {
      if (closing.text.toLowerCase().includes(work.toLowerCase().slice(0, 48))) continue;
      facts.push({ work, closing: closing.text, statedResult: closing.statedResult });
    }
  }
  if (facts.length === 0) {
    facts.push({
      work: `the duties already listed for ${role.title}`,
      closing: asSentence(`No separate result is stated for ${role.title}`),
      statedResult: false,
    });
  }
  return facts;
}

function factRank(fact: WorkFact, skill: FoundSkill): number {
  const blob = `${fact.work} ${fact.closing}`.toLowerCase();
  let score = 0;
  for (const term of CATEGORY_TERMS[skill.category]) {
    if (blob.includes(term)) score += 2;
  }
  return score;
}

function opening(verb: string, skill: string, work: string, pattern: number): string {
  if (pattern % 2 === 1) return `${verb} ${skill} for ${work}`;
  return `${verb} ${skill} while ${work}`;
}

function sentenceCount(text: string): number {
  return text.split(/(?<=[.!?])\s+/).filter((part) => part.trim().length > 0).length;
}

function tooSimilar(left: string, right: string): boolean {
  const words = left.toLowerCase().split(/\s+/);
  const other = right.toLowerCase();
  for (let index = 0; index <= words.length - 8; index += 1) {
    if (other.includes(words.slice(index, index + 8).join(" "))) return true;
  }
  return false;
}

export function craftBullet(
  skill: FoundSkill,
  role: ResumeRole,
  _fit: "close" | "weak",
  used: UsedPhrases,
): string {
  const verbs = VERBS[skillShape(skill)];
  const freshVerbs = verbs.filter((verb) => !used.verbs.has(verb));
  const verbOrder = freshVerbs.length ? freshVerbs : verbs;
  const facts = factsFor(role);
  const factOrder = [...facts].sort((a, b) => {
    const aFresh = Number(!used.closings.has(a.closing)) + Number(!used.works.has(a.work));
    const bFresh = Number(!used.closings.has(b.closing)) + Number(!used.works.has(b.work));
    return factRank(b, skill) - factRank(a, skill) || Number(b.statedResult) - Number(a.statedResult) || bFresh - aFresh;
  });
  let pattern = used.sentences.size;
  const bestUnusedRank = factOrder.reduce((best, fact) => {
    if (used.closings.has(fact.closing)) return best;
    return Math.max(best, factRank(fact, skill));
  }, 0);
  const unusedResult = factOrder.some((fact) => !used.closings.has(fact.closing) && fact.statedResult);
  for (const fact of factOrder) {
    if (used.closings.has(fact.closing) && (bestUnusedRank > 0 || unusedResult)) continue;
    for (const verb of verbOrder) {
      const first = opening(verb, skill.label, fact.work, pattern);
      pattern += 1;
      const closing = fact.closing.trim();
      const bullet = closing ? `${asSentence(first)} ${closing}` : asSentence(first);
      if (used.sentences.has(bullet)) continue;
      if (countMentions(bullet, skill.label) !== 1) continue;
      if (sentenceCount(bullet) !== (closing ? 2 : 1)) continue;
      if (first.split(/\s+/).length < 8) continue;
      if (closing && tooSimilar(asSentence(first), closing)) continue;
      used.works.add(fact.work);
      used.closings.add(fact.closing);
      used.verbs.add(verb);
      used.sentences.add(bullet);
      return bullet;
    }
  }
  const fallbackWork = facts[0]?.work ?? `the duties already listed for ${role.title}`;
  const fallback = `${asSentence(`Incorporated ${skill.label} while ${fallbackWork}`)} ${asSentence(`That writing stays with the ${role.title} bullets already on the resume`)}`;
  used.sentences.add(fallback);
  return fallback;
}

export type SuggestedBullet = {
  id: string;
  skillLabel: string;
  bullet: string;
  fit: "close" | "weak";
  fitNote: string;
};

export type SuggestionGroup = {
  roleId: string;
  title: string;
  organization: string;
  bullets: SuggestedBullet[];
};

export function suggestMissing(skills: FoundSkill[], roles: ResumeRole[]): SuggestionGroup[] {
  if (!skills.length || !roles.length) return [];
  const groups = new Map<string, SuggestionGroup>();
  const usedByRole = new Map<string, UsedPhrases>();
  for (const skill of skills) {
    const placed = chooseRole(skill, roles);
    const role = placed.role;
    let group = groups.get(role.id);
    if (!group) {
      group = { roleId: role.id, title: role.title, organization: role.orgPlain, bullets: [] };
      groups.set(role.id, group);
    }
    const used = usedByRole.get(role.id) ?? {
      works: new Set<string>(),
      closings: new Set<string>(),
      verbs: new Set<string>(),
      sentences: new Set<string>(),
    };
    usedByRole.set(role.id, used);
    group.bullets.push({
      id: `${role.id}:${skill.id}`,
      skillLabel: skill.label,
      bullet: craftBullet(skill, role, placed.fit, used),
      fit: placed.fit,
      fitNote:
        placed.fit === "weak"
          ? `Weak fit. Nothing already described for this role is close to ${skill.label}.`
          : "",
    });
  }
  return [...groups.values()].sort((a, b) => {
    const left = roles.find((role) => role.id === a.roleId)?.order ?? 0;
    const right = roles.find((role) => role.id === b.roleId)?.order ?? 0;
    return left - right;
  });
}
