import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

function summarizeLog(log: string): string {
  const lines = log.split(/\r?\n/);
  const interesting = lines.filter(
    (line) => line.startsWith("!") || /^l\.\d+/.test(line) || /Emergency stop|not found|Fatal/i.test(line),
  );
  const snippet = interesting.slice(0, 8).join("\n").trim();
  if (!snippet) return "pdflatex could not build a PDF. You can still download the .tex file and compile it locally.";
  return `pdflatex could not build a PDF. You can still download the .tex file.\n${snippet.slice(0, 700)}`;
}

export async function compileTex(tex: string): Promise<{ pdf: Buffer | null; error: string | null }> {
  let dir: string | null = null;
  try {
    dir = await mkdtemp(path.join(tmpdir(), "fitline-"));
    await writeFile(path.join(dir, "resume.tex"), tex, "utf8");
    try {
      await execFileAsync(
        "pdflatex",
        ["-no-shell-escape", "-interaction=nonstopmode", "-halt-on-error", "resume.tex"],
        { cwd: dir, timeout: 45000, maxBuffer: 10 * 1024 * 1024 },
      );
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
      if (code === "ENOENT") {
        return {
          pdf: null,
          error: "pdflatex is not installed on this machine, so there is no PDF preview. You can still download the .tex file and compile it locally.",
        };
      }
      const log = await readFile(path.join(dir, "resume.log"), "utf8").catch(() => "");
      const pdf = await readFile(path.join(dir, "resume.pdf")).catch(() => null);
      if (pdf && pdf.length > 500) return { pdf, error: null };
      if (!log.trim()) {
        return {
          pdf: null,
          error: "pdflatex failed before it wrote a log. You can still download the .tex file and compile it locally.",
        };
      }
      return { pdf: null, error: summarizeLog(log) };
    }
    const pdf = await readFile(path.join(dir, "resume.pdf"));
    return { pdf, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "pdflatex failed";
    if (/ENOENT|not found/i.test(message)) {
      return {
        pdf: null,
        error: "pdflatex is not installed on this machine, so there is no PDF preview. You can still download the .tex file and compile it locally.",
      };
    }
    return { pdf: null, error: message };
  } finally {
    if (dir) await rm(dir, { recursive: true, force: true }).catch(() => undefined);
  }
}
