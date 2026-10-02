import { extractText } from "unpdf";
import type { ParsedResume, ResumeRole, ResumeSection, ResumeSectionKind } from "@/lib/types";

const HEADING =
  /^(professional summary|summary|profile|objective|technical skills|core skills|skills|technologies|selected publications|publications|papers|education|academic background|awards(?:\s*(?:&|and)\s*certifications)?|certifications|(?:.*\s)?experience)$/i;

const DATE =
  /((?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+\d{4}|\d{4})\s*(?:--|–|—|-|to)\s*((?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s+\d{4}|\d{4}|present|current|expected)/i;

function kindOf(title: string): ResumeSectionKind {
  const t = title.toLowerCase();
  if (/summary|profile|objective/.test(t)) return "summary";
  if (/skill|technolog/.test(t)) return "skills";
  if (/publication|paper/.test(t)) return "publications";
  if (/education|academic/.test(t)) return "education";
  if (/award|certification/.test(t)) return "awards";
  if (/experience/.test(t)) return "experience";
  return "other";
}

function cleanLine(line: string): string {
  return line.replace(/\s+/g, " ").trim();
}

export function parseResumeText(raw: string, fileName: string): ParsedResume {
  const normalized = raw.replace(/\r/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  const lines = normalized.split("\n").map(cleanLine);
  const sections: ResumeSection[] = [];
  const roles: ResumeRole[] = [];
  let current: ResumeSection | null = null;
  let role: ResumeRole | null = null;
  const nameLine = lines.find((line) => line && line.length < 48 && !HEADING.test(line) && !DATE.test(line) && /[A-Za-z]/.test(line));

  function makeSection(title: string): ResumeSection {
    const section: ResumeSection = {
      id: `section-${sections.length}`,
      title,
      kind: kindOf(title),
      text: "",
      bullets: [],
      roleIds: [],
    };
    sections.push(section);
    return section;
  }

  for (const line of lines) {
    if (!line) continue;
    if (line.length < 70 && HEADING.test(line)) {
      current = makeSection(line.replace(/\s+/g, " "));
      role = null;
      continue;
    }
    const date = DATE.exec(line);
    if (date && line.length < 160) {
      if (!current || current.kind === "summary" || current.kind === "skills") {
        current = makeSection("Experience");
        role = null;
      }
      const before = line.slice(0, date.index).replace(/[|•·\-–—]+$/g, "").trim();
      const parts = before.split(/\s+[—–-]\s+|\s+\|\s+/);
      const title = (parts[0] || current.title || "Experience").trim();
      const org = (parts.slice(1).join(" — ") || "").trim();
      const next: ResumeRole = {
        id: `role-${roles.length}`,
        order: roles.length,
        title,
        orgPlain: org,
        dates: date[0].replace(/\s+/g, " "),
        bullets: [],
        sectionTitle: current.title,
        itemizeEnd: -1,
        insertAt: 0,
      };
      roles.push(next);
      current.roleIds.push(next.id);
      if (current.kind === "other") current.kind = "experience";
      role = next;
      continue;
    }
    if (!current) {
      current = makeSection("Summary");
      role = null;
    }
    const bullet = line.replace(/^[•·\-*]\s+/, "");
    if (role) role.bullets.push(bullet);
    else if (/^[•·\-*]\s+/.test(line) || current.kind === "publications") current.bullets.push(bullet);
    else current.text = current.text ? `${current.text} ${bullet}` : bullet;
  }

  if (!sections.length) {
    sections.push({
      id: "section-0",
      title: "Resume text",
      kind: "summary",
      text: normalized.replace(/\s+/g, " ").slice(0, 4000),
      bullets: [],
      roleIds: [],
    });
  }

  if (!roles.length) {
    const host = sections.find((section) => section.kind === "experience") ?? sections[sections.length - 1];
    const synthetic: ResumeRole = {
      id: "role-0",
      order: 0,
      title: "Experience",
      orgPlain: "",
      dates: "",
      bullets: [],
      sectionTitle: host.title,
      itemizeEnd: -1,
      insertAt: 0,
    };
    roles.push(synthetic);
    host.roleIds.push(synthetic.id);
    if (host.kind === "other" || host.kind === "summary") host.kind = "experience";
  }

  return {
    sourceType: "pdf",
    fileName,
    source: normalized,
    plainText: normalized.replace(/\s+/g, " ").trim(),
    name: nameLine,
    sections,
    roles,
  };
}

export async function parsePdf(data: Uint8Array, fileName: string): Promise<ParsedResume> {
  const extracted = await extractText(data, { mergePages: true });
  const text = extracted.text.trim();
  if (text.replace(/\s+/g, "").length < 40) {
    throw new Error("No text could be read from this PDF. If it is a scan, upload the .tex file instead.");
  }
  return parseResumeText(text, fileName);
}
