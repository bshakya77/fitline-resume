import { htmlToText } from "@/lib/html-text";

const SECTIONS = ["Responsibilities", "Duties", "Requirements", "Preferred Qualifications"] as const;

type SectionName = (typeof SECTIONS)[number];

function plainLabel(value: string): string {
  return value
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[:?.!]+$/g, "")
    .trim();
}

function classify(label: string): SectionName | "skip" | null {
  const text = plainLabel(label);
  if (!text || text.length > 70) return null;
  if (
    /^(about( (the|our))?( (team|company|us|department|university))?|who we are|who is .+|rewards?|benefits?|what we offer|why (join|work( (here|with us))?)?|compensation|perks|how to apply|to apply|application( process| procedures| instructions)?|special instructions|equal (opportunity|employment)|eeo|diversity|accommodations?|seniority level|employment type|job function|industries|closing date|notice to applicants)$/i.test(
      text,
    )
  ) {
    return "skip";
  }
  if (/preferred qualif|desired qualif|nice to have|^preferred$|^desired$/i.test(text)) {
    return "Preferred Qualifications";
  }
  if (/\bduties\b/i.test(text)) return "Duties";
  if (
    /responsibilit|how you'll make an impact|what you'll do|what you will do|snapshot of your day|position purpose|essential functions|your role|job summary|role overview|^the role$/i.test(
      text,
    )
  ) {
    return "Responsibilities";
  }
  if (
    /requirements?|qualifications?|what you bring|what you'll need|knowledge,?\s+skills?,?\s+and\s+abilities|skills?\s+(?:and|&)\s+abilit|skill requirements?|project requirements?|minimum qualif|basic qualif|required (skills?|experience|education|license)|^knowledge of$/i.test(
      text,
    )
  ) {
    return "Requirements";
  }
  return null;
}

function isSubhead(label: string): boolean {
  return /^(knowledge of|skills?\s+(?:and|&)\s+abilit(?:y|ies)(?: to)?|required license)$/i.test(plainLabel(label));
}

function isNoise(line: string): boolean {
  return /\b(authorized to work|legally authorized|eligible to work|work authorization|background check)\b/i.test(line);
}

function isBoilerplate(line: string): boolean {
  return (
    /^(to apply|please attach|applications must be made|equal employment|for more information regarding|this system will guide you|any offer of employment|email applications will not)\b/i.test(line) ||
    /\b(equal opportunity employer|comprehensive benefits package|drug-free environment|tobacco free)\b/i.test(line) ||
    /^the .{3,80}department has\b/i.test(line)
  );
}

function isPreferredLine(line: string): boolean {
  return (
    /\b(is|are|strongly)\s+preferred\b/i.test(line) ||
    /\b(is a plus|is beneficial|nice to have)\b/i.test(line) ||
    /\bpreferred\b/i.test(line) && /\b(degree|experience|qualification|skill)\b/i.test(line)
  );
}

function sentences(line: string): string[] {
  return line
    .split(/(?<=[.!?])\s+/)
    .flatMap((part) => {
      const marker = part.search(/\b(?:responsibilities include|duties include|prefer(?:red)? applicant)\b/i);
      if (marker > 0) return [part.slice(0, marker).trim(), part.slice(marker).trim()];
      return [part.trim()];
    })
    .filter(Boolean);
}

function loosePiece(sentence: string): { name: SectionName; text: string } | null {
  const text = sentence.replace(/[.;]+$/g, "").trim();
  const lead = /^(responsibilities|duties) include\s+/i.exec(text);
  if (lead) {
    const body = text.slice(lead[0].length).replace(/[,;]+$/g, "").trim();
    if (body.length < 12) return null;
    return { name: /^duties/i.test(lead[1]) ? "Duties" : "Responsibilities", text: body };
  }
  if (/^prefer(?:red)? applicant\b/i.test(text)) return { name: "Preferred Qualifications", text };
  if (/^must\b/i.test(text) && text.length > 12) return { name: "Requirements", text };
  return null;
}

function headingOf(line: string): { name: SectionName | "skip"; label: string; rest: string } | null {
  const normalized = line.replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim();
  const split = /^([^:]{3,70}):\s*(.*)$/.exec(normalized);
  const label = plainLabel(split ? split[1] : normalized);
  const rest = split?.[2]?.trim() ?? "";
  if (!split && (label.length > 70 || /[.!]/.test(normalized))) return null;
  const name = classify(label);
  if (!name) return null;
  return { name, label, rest };
}

/** Keeps responsibilities, duties, requirements, and preferred qualifications. */
export function excerptForCopy(source: string): string {
  const buckets: Record<SectionName, string[]> = {
    Responsibilities: [],
    Duties: [],
    Requirements: [],
    "Preferred Qualifications": [],
  };
  let current: SectionName | "skip" | null = null;
  for (const raw of htmlToText(source).split("\n")) {
    const line = raw.replace(/\s+/g, " ").trim();
    if (!line || /^(show more|show less)$/i.test(line)) continue;
    const heading = headingOf(line);
    if (heading) {
      current = heading.name;
      if (heading.name !== "skip" && isSubhead(heading.label)) {
        const subhead = heading.label.endsWith(":") ? heading.label : `${plainLabel(heading.label)}:`;
        buckets[heading.name].push(subhead);
      }
      if (heading.name !== "skip" && heading.rest && !isBoilerplate(heading.rest) && !isNoise(heading.rest)) {
        const target = isPreferredLine(heading.rest) ? "Preferred Qualifications" : heading.name;
        buckets[target].push(heading.rest);
      }
      continue;
    }
    if (isBoilerplate(line)) {
      current = "skip";
      continue;
    }
    if (/^specific duties\b/i.test(line)) {
      current = "Duties";
      buckets.Duties.push(line);
      continue;
    }
    if (!current) {
      for (const sentence of sentences(line)) {
        const piece = loosePiece(sentence);
        if (piece && !isNoise(piece.text)) {
          const text = piece.text.charAt(0).toUpperCase() + piece.text.slice(1);
          buckets[piece.name].push(text);
        }
      }
      continue;
    }
    if (current === "skip") continue;
    if (isNoise(line)) continue;
    if (isPreferredLine(line)) {
      buckets["Preferred Qualifications"].push(line);
      continue;
    }
    buckets[current].push(line);
  }
  return SECTIONS.filter((name) => buckets[name].length > 0)
    .map((name) => `${name}\n${buckets[name].join("\n")}`)
    .join("\n\n");
}
