const ELIGIBILITY = [
  /\bu\.s\.\s+citizens?\b/i,
  /\bus\s+citizens?\b/i,
  /\bunited states citizens?\b/i,
  /\bcitizenship required\b/i,
  /\bmust be a citizen\b/i,
  /\bgreen cards?\b/i,
  /\bpermanent residents?\b/i,
  /\bgc required\b/i,
];

const CLEARANCE = [
  /\bsecret clearance\b/i,
  /\btop secret\b/i,
  /\bts\s*\/\s*sci\b/i,
  /\bsci\b/i,
  /\bsecurity clearance required\b/i,
  /\b(counterintelligence|full[- ]scope|ci)\s+polygraph\b/i,
  /\bpolygraph\b[^.\n]{0,40}\b(required|clearance)\b/i,
  /\b(required|clearance)\b[^.\n]{0,40}\bpolygraph\b/i,
];

const CLEARANCE_NOT_REQUIRED =
  /\bno clearance required\b|\bclearance (?:is |isn't |isnt )?not required\b|\bsecurity clearance (?:is )?not required\b|\bnot require(?:d)? (?:a )?(?:security )?clearance\b|\bwithout (?:a )?(?:security )?clearance\b|\bpolygraph\b[^.\n]{0,24}\bnot required\b|\bno polygraph\b/i;

export function requiresCitizenshipOrGreenCard(text: string): boolean {
  return ELIGIBILITY.some((pattern) => pattern.test(text));
}

export function requiresClearance(text: string): boolean {
  const lines = text.split(/\n|(?<=[.!?])\s+/);
  return lines.some((line) => CLEARANCE.some((pattern) => pattern.test(line)) && !CLEARANCE_NOT_REQUIRED.test(line));
}

export function keepScoredListing(score: number | null, text: string): boolean {
  if (typeof score !== "number" || !Number.isFinite(score) || score < 10) return false;
  return !requiresCitizenshipOrGreenCard(text) && !requiresClearance(text);
}
