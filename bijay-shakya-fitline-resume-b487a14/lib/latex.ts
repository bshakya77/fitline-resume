export function escapeLatex(value: string): string {
  const map: Record<string, string> = {
    "\\": "\\textbackslash{}",
    "&": "\\&",
    "%": "\\%",
    $: "\\$",
    "#": "\\#",
    _: "\\_",
    "{": "\\{",
    "}": "\\}",
    "~": "\\textasciitilde{}",
    "^": "\\textasciicircum{}",
  };
  return value.replace(/[\\&%$#_{}~^]/g, (ch) => map[ch] ?? ch);
}

export function isCommented(source: string, index: number): boolean {
  const lineStart = source.lastIndexOf("\n", index - 1) + 1;
  const prefix = source.slice(lineStart, index);
  for (let i = 0; i < prefix.length; i++) {
    if (prefix[i] === "%" && (i === 0 || prefix[i - 1] !== "\\")) return true;
  }
  return false;
}

export function readArg(
  source: string,
  open: number,
): { arg: string; end: number } | null {
  if (source[open] !== "{") return null;
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    const ch = source[i];
    if (ch === "\\") {
      i++;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return { arg: source.slice(open + 1, i), end: i + 1 };
    }
  }
  return null;
}

export function collectMacros(source: string): Map<string, string> {
  const macros = new Map<string, string>();
  let cursor = 0;
  while (cursor < source.length) {
    const idx = source.indexOf("\\newcommand", cursor);
    if (idx < 0) break;
    if (isCommented(source, idx)) {
      cursor = idx + 11;
      continue;
    }
    let j = idx + "\\newcommand".length;
    while (j < source.length && /\s/.test(source[j])) j++;
    if (source[j] !== "{") {
      cursor = j + 1;
      continue;
    }
    const nameArg = readArg(source, j);
    if (!nameArg) break;
    j = nameArg.end;
    while (j < source.length && /\s/.test(source[j])) j++;
    if (source[j] === "[") {
      const close = source.indexOf("]", j);
      if (close < 0) break;
      j = close + 1;
      while (j < source.length && /\s/.test(source[j])) j++;
    }
    if (source[j] !== "{") {
      cursor = j + 1;
      continue;
    }
    const body = readArg(source, j);
    if (!body) break;
    const name = nameArg.arg.replace(/^\\/, "");
    if (name && !body.arg.includes("#") && !nameArg.arg.includes("#")) {
      macros.set(name, body.arg);
    }
    cursor = body.end;
  }
  return macros;
}

function expandMacros(source: string, macros: Map<string, string>): string {
  let current = source;
  for (let pass = 0; pass < 4; pass++) {
    let next = "";
    for (let i = 0; i < current.length; i++) {
      if (current[i] !== "\\") {
        next += current[i];
        continue;
      }
      const match = /^\\([a-zA-Z]+)/.exec(current.slice(i));
      if (!match) {
        next += current[i];
        continue;
      }
      const body = macros.get(match[1]);
      const after = i + match[0].length;
      if (!body || current[after] === "{") {
        next += match[0];
        i = after - 1;
        continue;
      }
      next += body;
      i = after - 1;
    }
    if (next === current) break;
    current = next;
  }
  return current;
}

export function latexToPlain(input: string, macros?: Map<string, string>): string {
  let s = macros ? expandMacros(input, macros) : input;
  s = s.replace(/(^|[^\\])%.*$/gm, "$1");
  s = s.replace(/\\linkline\s*\{(?:[^{}]|\{[^{}]*\})*\}/g, " ");
  s = s.replace(/\\([&%$#_{}])/g, "$1");
  s = s.replace(/\\(?: |,|;|:|!)/g, " ");
  s = s.replace(/~+/g, " ");
  s = s.replace(/---/g, " — ");
  s = s.replace(/--/g, " – ");
  for (let pass = 0; pass < 6; pass++) {
    const next = s
      .replace(/\\href\s*\{[^{}]*\}\s*\{([^{}]*)\}/g, "$1")
      .replace(
        /\\(?:textbf|textit|emph|textrm|texttt|textsc|underline|mbox|textsuperscript|footnote)\s*\{([^{}]*)\}/g,
        "$1",
      );
    if (next === s) break;
    s = next;
  }
  s = s.replace(/\\[a-zA-Z]+\*?(?:\[[^\]]*\])?/g, " ");
  s = s.replace(/[{}]/g, " ");
  s = s.replace(/\$/g, " ");
  s = s.replace(/\s+/g, " ");
  return s.trim();
}
