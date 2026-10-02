import { collectMacros, isCommented, latexToPlain, readArg } from "@/lib/latex";
import type { ParsedResume, ResumeRole, ResumeSection, ResumeSectionKind } from "@/lib/types";

type ItemEvent = { kind: "item"; index: number };
type BeginEvent = { kind: "begin"; index: number; end: number };
type EndEvent = { kind: "end"; index: number };
type SectionEvent = { kind: "section"; title: string; index: number; headerEnd: number };
type RoleEvent = {
  kind: "role";
  title: string;
  org: string;
  dates: string;
  index: number;
  end: number;
};
type Event = ItemEvent | BeginEvent | EndEvent | SectionEvent | RoleEvent;

function sectionKind(title: string): ResumeSectionKind {
  const t = title.toLowerCase();
  if (t.includes("summary") || t.includes("objective") || t.includes("profile")) return "summary";
  if (t.includes("skill")) return "skills";
  if (t.includes("publication") || t.includes("paper")) return "publications";
  if (t.includes("education")) return "education";
  if (t.includes("award") || t.includes("certification")) return "awards";
  if (t.includes("experience") || t.includes("employment") || t.includes("work history")) return "experience";
  return "other";
}

function scan(source: string): Event[] {
  const events: Event[] = [];
  let i = 0;
  while (i < source.length) {
    if (source.startsWith("\\section", i) && !isCommented(source, i)) {
      let j = i + "\\section".length;
      if (source[j] === "*") j++;
      while (j < source.length && /\s/.test(source[j])) j++;
      if (source[j] === "{") {
        const arg = readArg(source, j);
        if (arg) {
          events.push({ kind: "section", title: arg.arg, index: i, headerEnd: arg.end });
          i = arg.end;
          continue;
        }
      }
    }
    if (
      source.startsWith("\\role", i) &&
      !/[a-zA-Z]/.test(source[i + 5] ?? "") &&
      !isCommented(source, i)
    ) {
      let j = i + "\\role".length;
      const args: string[] = [];
      let ok = true;
      for (let n = 0; n < 3; n++) {
        while (j < source.length && /\s/.test(source[j])) j++;
        if (source[j] !== "{") {
          ok = false;
          break;
        }
        const arg = readArg(source, j);
        if (!arg) {
          ok = false;
          break;
        }
        args.push(arg.arg);
        j = arg.end;
      }
      if (ok) {
        events.push({
          kind: "role",
          title: args[0],
          org: args[1],
          dates: args[2],
          index: i,
          end: j,
        });
        i = j;
        continue;
      }
    }
    if (source.startsWith("\\begin{itemize}", i) && !isCommented(source, i)) {
      const end = i + "\\begin{itemize}".length;
      events.push({ kind: "begin", index: i, end });
      i = end;
      continue;
    }
    if (source.startsWith("\\end{itemize}", i) && !isCommented(source, i)) {
      events.push({ kind: "end", index: i });
      i += "\\end{itemize}".length;
      continue;
    }
    if (
      source.startsWith("\\item", i) &&
      !/[a-zA-Z]/.test(source[i + 5] ?? "") &&
      !isCommented(source, i)
    ) {
      events.push({ kind: "item", index: i });
      i += 5;
      continue;
    }
    i++;
  }
  return events;
}

function plain(source: string, macros: Map<string, string>, start: number, end: number): string {
  return latexToPlain(source.slice(start, end), macros);
}

export function parseTex(source: string, fileName: string): ParsedResume {
  const text = source.replace(/^\uFEFF/, "");
  const macros = collectMacros(text);
  const events = scan(text);
  const sections: ResumeSection[] = [];
  const roles: ResumeRole[] = [];
  let current: ResumeSection | null = null;
  let pending: ResumeRole | null = null;
  let attached = false;
  let depth = 0;
  let itemStart = -1;
  let collecting: "role" | "section" | null = null;

  function finishItem(end: number) {
    if (itemStart < 0 || !collecting) return;
    const body = plain(text, macros, itemStart, end);
    if (!body) {
      itemStart = -1;
      return;
    }
    if (collecting === "role" && pending) pending.bullets.push(body);
    else if (collecting === "section" && current) current.bullets.push(body);
    itemStart = -1;
  }

  for (const event of events) {
    if (event.kind === "section") {
      finishItem(event.index);
      current = {
        id: `section-${sections.length}`,
        title: latexToPlain(event.title, macros) || "Section",
        kind: sectionKind(latexToPlain(event.title, macros)),
        text: "",
        bullets: [],
        roleIds: [],
      };
      sections.push(current);
      pending = null;
      attached = false;
      continue;
    }
    if (event.kind === "role") {
      finishItem(event.index);
      if (!current) {
        current = {
          id: `section-${sections.length}`,
          title: "Experience",
          kind: "experience",
          text: "",
          bullets: [],
          roleIds: [],
        };
        sections.push(current);
      }
      if (current.kind === "other") current.kind = "experience";
      const role: ResumeRole = {
        id: `role-${roles.length}`,
        order: roles.length,
        title: latexToPlain(event.title, macros) || "Role",
        orgPlain: latexToPlain(event.org, macros),
        dates: latexToPlain(event.dates, macros),
        bullets: [],
        sectionTitle: current.title,
        itemizeEnd: -1,
        insertAt: event.end,
      };
      roles.push(role);
      current.roleIds.push(role.id);
      pending = role;
      attached = false;
      continue;
    }
    if (event.kind === "begin") {
      depth++;
      if (depth !== 1) continue;
      finishItem(event.index);
      if (pending && !attached) {
        collecting = "role";
        attached = true;
      } else {
        collecting = current ? "section" : null;
      }
      continue;
    }
    if (event.kind === "item") {
      if (depth < 1) continue;
      finishItem(event.index);
      itemStart = event.index + "\\item".length;
      continue;
    }
    if (event.kind === "end") {
      if (depth === 1) {
        finishItem(event.index);
        if (collecting === "role" && pending) pending.itemizeEnd = event.index;
        collecting = null;
      }
      depth = Math.max(0, depth - 1);
    }
  }

  const sectionEvents = events.filter((event): event is SectionEvent => event.kind === "section");
  const roleEvents = events.filter((event): event is RoleEvent => event.kind === "role");
  let roleCursor = 0;
  sections.forEach((section, index) => {
    const header = sectionEvents[index];
    if (!header) return;
    const next = sectionEvents[index + 1]?.index ?? text.length;
    const roleEvent = section.roleIds.length ? roleEvents[roleCursor] : undefined;
    roleCursor += section.roleIds.length;
    const textEnd =
      roleEvent && roleEvent.index > header.headerEnd && roleEvent.index < next ? roleEvent.index : next;
    section.text = plain(text, macros, header.headerEnd, textEnd);
  });

  if (!roles.length) {
    const endDoc = text.lastIndexOf("\\end{document}");
    const insertAt = endDoc >= 0 ? endDoc : text.length;
    const host =
      sections.find((section) => section.kind === "experience") ??
      sections[sections.length - 1];
    const role: ResumeRole = {
      id: "role-0",
      order: 0,
      title: host?.kind === "experience" ? host.title : "Experience",
      orgPlain: "",
      dates: "",
      bullets: host?.bullets ?? [],
      sectionTitle: host?.title ?? "Experience",
      itemizeEnd: -1,
      insertAt,
    };
    roles.push(role);
    if (host) {
      host.roleIds.push(role.id);
      if (host.kind === "other") host.kind = "experience";
    } else {
      sections.push({
        id: "section-0",
        title: "Experience",
        kind: "experience",
        text: latexToPlain(text, macros),
        bullets: [],
        roleIds: [role.id],
      });
    }
  }

  return {
    sourceType: "tex",
    fileName,
    source: text,
    plainText: latexToPlain(text, macros),
    sections,
    roles,
  };
}
