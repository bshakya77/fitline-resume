export type SkillCategory =
  | "vision"
  | "deployment"
  | "research"
  | "ml"
  | "backend"
  | "sql"
  | "healthcare"
  | "data"
  | "general";

export type SkillDef = {
  id: string;
  label: string;
  category: SkillCategory;
  /** Lowercase phrases matched with word boundaries. */
  aliases: string[];
  /** Matched against the original casing, for short tokens like REST. */
  caseAliases?: string[];
};

export type FoundSkill = {
  id: string;
  label: string;
  category: SkillCategory;
  source: "catalog" | "posting";
};

export type ResumeSectionKind =
  | "summary"
  | "skills"
  | "experience"
  | "publications"
  | "education"
  | "awards"
  | "other";

export type ResumeRole = {
  id: string;
  order: number;
  title: string;
  orgPlain: string;
  dates: string;
  bullets: string[];
  sectionTitle: string;
  /** Index of `\end{itemize}` in the original .tex, or -1 when there is no list. */
  itemizeEnd: number;
  /** Used when a role has no itemize yet. */
  insertAt: number;
};

export type ResumeSection = {
  id: string;
  title: string;
  kind: ResumeSectionKind;
  text: string;
  bullets: string[];
  roleIds: string[];
};

export type ParsedResume = {
  sourceType: "tex" | "pdf";
  fileName: string;
  /** Original .tex, or extracted text when the upload was a PDF. */
  source: string;
  plainText: string;
  name?: string;
  sections: ResumeSection[];
  roles: ResumeRole[];
};

export type Suggestion = {
  id: string;
  skill: FoundSkill;
  roleId: string;
  bullet: string;
  fit: "close" | "weak";
  fitNote: string;
};

export type Analysis = {
  posting: FoundSkill[];
  present: FoundSkill[];
  missing: Suggestion[];
};

export type AcceptedBullet = {
  roleId: string;
  bullet: string;
  skillLabel: string;
};

export type PreviewBullet = {
  text: string;
  isNew: boolean;
};

export type PreviewRole = {
  id: string;
  title: string;
  orgPlain: string;
  dates: string;
  sectionTitle: string;
  bullets: PreviewBullet[];
};

export type GenerateResult = {
  tex: string;
  pdfBase64: string | null;
  compileError: string | null;
  previewRoles: PreviewRole[];
  fromPdf: boolean;
  note: string;
};
