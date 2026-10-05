import type { JobScoreParts } from "@/lib/job-score";
import { findPostingSkills, skillAppearsIn } from "@/lib/skills";
import type { FoundSkill, ParsedResume } from "@/lib/types";

export type ScorePart = {
  score: number;
  hit: number;
  total: number;
};

export type ExperienceScore = {
  score: number;
  skillsHit: number;
  skillsTotal: number;
  requirementsHit: number;
  requirementsTotal: number;
};

export type MatchResult = {
  posting: FoundSkill[];
  present: FoundSkill[];
  missing: FoundSkill[];
  /** Filled by scoreJobFit. Null until that function scores the posting. */
  score: number | null;
  parts: JobScoreParts | null;
  keyword: ScorePart | null;
  experience: ExperienceScore | null;
  needsMoreJobText: boolean;
};

const REQUIREMENT_STOP = new Set([
  "about", "above", "across", "after", "again", "against", "ability", "able", "also",
  "among", "and", "another", "any", "are", "around", "because", "been", "before",
  "being", "below", "between", "both", "build", "building", "built", "but", "candidate",
  "can", "cannot", "come", "could", "describe", "does", "doing", "done", "during",
  "each", "either", "else", "equal", "etc", "every", "experience", "familiar", "fast",
  "for", "from", "full", "good", "great", "have", "having", "help", "here", "high",
  "how", "including", "into", "job", "join", "just", "know", "knowledge", "large",
  "like", "looking", "make", "many", "more", "most", "must", "need", "needed", "new",
  "not", "now", "one", "only", "opportunity", "other", "our", "out", "over", "part",
  "people", "per", "plus", "position", "preferred", "proficient", "required", "role",
  "should", "skills", "solid", "some", "strong", "such", "team", "than", "that",
  "the", "their", "them", "then", "there", "these", "they", "this", "those", "through",
  "time", "using", "very", "want", "well", "what", "when", "where", "which", "while",
  "who", "will", "with", "within", "work", "working", "would", "year", "years", "you",
  "your",
]);

export function requirementTerms(jobText: string): string[] {
  const words = jobText
    .toLowerCase()
    .split(/[^a-z0-9+#.-]+/)
    .map((word) => word.replace(/^[.-]+|[.-]+$/g, ""))
    .filter((word) => word.length >= 4 && !REQUIREMENT_STOP.has(word) && !/^\d+$/.test(word));
  return [...new Set(words)].slice(0, 80);
}

export function analyzeResume(jobText: string, resume: ParsedResume): MatchResult {
  const posting = findPostingSkills(jobText);
  const present = posting.filter((skill) => skillAppearsIn(skill, resume.plainText));
  const missing = posting.filter((skill) => !skillAppearsIn(skill, resume.plainText));
  if (posting.length === 0) {
    return {
      posting,
      present,
      missing,
      score: null,
      parts: null,
      keyword: null,
      experience: null,
      needsMoreJobText: true,
    };
  }

  return {
    posting,
    present,
    missing,
    score: null,
    parts: null,
    keyword: null,
    experience: null,
    needsMoreJobText: false,
  };
}
