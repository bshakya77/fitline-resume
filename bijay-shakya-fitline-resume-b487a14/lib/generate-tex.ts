import { escapeLatex } from "@/lib/latex";
import type { AcceptedBullet, ParsedResume, PreviewRole, ResumeRole } from "@/lib/types";

function cleanBullet(bullet: string): string {
  return bullet.replace(/\s+/g, " ").trim();
}

export function insertAcceptedBullets(
  source: string,
  roles: ResumeRole[],
  accepted: AcceptedBullet[],
): string {
  const grouped = new Map<string, string[]>();
  for (const item of accepted) {
    const bullet = cleanBullet(item.bullet);
    if (!bullet) continue;
    const list = grouped.get(item.roleId) ?? [];
    list.push(escapeLatex(bullet));
    grouped.set(item.roleId, list);
  }

  const targets = roles.filter((role) => grouped.has(role.id));
  const withList = targets
    .filter((role) => role.itemizeEnd >= 0)
    .sort((a, b) => b.itemizeEnd - a.itemizeEnd);
  const withoutList = targets
    .filter((role) => role.itemizeEnd < 0)
    .sort((a, b) => b.insertAt - a.insertAt);

  let out = source;
  for (const role of withList) {
    const marker = "\\end{itemize}";
    if (out.slice(role.itemizeEnd, role.itemizeEnd + marker.length) !== marker) {
      throw new Error(`Could not find the bullet list for ${role.title}.`);
    }
    const lines = (grouped.get(role.id) ?? []).map((bullet) => `    \\item ${bullet}`).join("\n");
    const prefix = role.itemizeEnd > 0 && out[role.itemizeEnd - 1] !== "\n" ? "\n" : "";
    out = `${out.slice(0, role.itemizeEnd)}${prefix}${lines}\n${out.slice(role.itemizeEnd)}`;
  }
  for (const role of withoutList) {
    if (role.insertAt < 0 || role.insertAt > out.length) {
      throw new Error(`Could not find where to add bullets for ${role.title}.`);
    }
    const lines = (grouped.get(role.id) ?? []).map((bullet) => `    \\item ${bullet}`).join("\n");
    const block = `\\begin{itemize}\n${lines}\n\\end{itemize}\n`;
    out = `${out.slice(0, role.insertAt)}\n${block}${out.slice(role.insertAt)}`;
  }
  return out;
}

const PREAMBLE = `\\documentclass[11pt,letterpaper]{article}
\\usepackage[T1]{fontenc}
\\usepackage{mathptmx}
\\usepackage[margin=0.65in]{geometry}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage[hidelinks]{hyperref}
\\pagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}
\\setlist[itemize]{leftmargin=1.15em,itemsep=1pt,topsep=2pt,parsep=0pt}
\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{8pt}{3pt}
\\newcommand{\\role}[3]{%
  \\vspace{4pt}%
  \\noindent\\textbf{#1} --- #2\\hfill\\textbf{#3}\\par
  \\nopagebreak
}
`;

export function rebuildFromPdf(resume: ParsedResume, accepted: AcceptedBullet[]): string {
  const extra = new Map<string, string[]>();
  for (const item of accepted) {
    const bullet = cleanBullet(item.bullet);
    if (!bullet) continue;
    const list = extra.get(item.roleId) ?? [];
    list.push(bullet);
    extra.set(item.roleId, list);
  }

  const lines = [
    "% Rebuilt from extracted PDF text. The original PDF layout is not preserved.",
    PREAMBLE.trimEnd(),
    "\\begin{document}",
    "\\begin{center}",
    `{\\LARGE\\bfseries ${escapeLatex(resume.name || "Resume")}}`,
    "\\end{center}",
  ];

  const placed = new Set<string>();
  for (const section of resume.sections) {
    lines.push(`\\section*{${escapeLatex(section.title)}}`);
    if (section.text.trim()) lines.push(`${escapeLatex(section.text.trim())}`, "");
    if (section.bullets.length && section.roleIds.length === 0) {
      lines.push("\\begin{itemize}");
      for (const bullet of section.bullets) lines.push(`  \\item ${escapeLatex(bullet)}`);
      lines.push("\\end{itemize}");
    }
    for (const roleId of section.roleIds) {
      const role = resume.roles.find((item) => item.id === roleId);
      if (!role) continue;
      placed.add(role.id);
      writeRole(lines, role, extra.get(role.id) ?? []);
    }
  }
  for (const role of resume.roles) {
    if (placed.has(role.id)) continue;
    if (!resume.sections.length) lines.push("\\section*{Experience}");
    writeRole(lines, role, extra.get(role.id) ?? []);
  }
  lines.push("\\end{document}", "");
  return lines.join("\n");
}

function writeRole(lines: string[], role: ResumeRole, added: string[]) {
  lines.push(
    `\\role{${escapeLatex(role.title)}}{${escapeLatex(role.orgPlain)}}{${escapeLatex(role.dates)}}`,
  );
  const bullets = [...role.bullets, ...added].map(cleanBullet).filter(Boolean);
  if (!bullets.length) return;
  lines.push("\\begin{itemize}");
  for (const bullet of bullets) lines.push(`  \\item ${escapeLatex(bullet)}`);
  lines.push("\\end{itemize}");
}

export function previewRoles(resume: ParsedResume, accepted: AcceptedBullet[]): PreviewRole[] {
  return resume.roles.map((role) => ({
    id: role.id,
    title: role.title,
    orgPlain: role.orgPlain,
    dates: role.dates,
    sectionTitle: role.sectionTitle,
    bullets: [
      ...role.bullets.map((text) => ({ text, isNew: false })),
      ...accepted
        .filter((item) => item.roleId === role.id)
        .map((item) => ({ text: cleanBullet(item.bullet), isNew: true }))
        .filter((item) => item.text),
    ],
  }));
}
