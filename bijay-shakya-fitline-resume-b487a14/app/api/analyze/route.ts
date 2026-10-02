import { analyzeResume } from "@/lib/analyze";
import { scoreJobFit } from "@/lib/job-score";
import type { ParsedResume } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { jobText?: string; resume?: ParsedResume };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Send the job text and the parsed resume." }, { status: 400 });
  }
  const jobText = body.jobText?.trim() ?? "";
  if (jobText.length < 20) {
    return Response.json(
      { error: "Paste more of the job description, including the requirements and tools." },
      { status: 400 },
    );
  }
  if (!body.resume?.plainText?.trim()) {
    return Response.json({ error: "Upload a resume before scoring the match." }, { status: 400 });
  }
  try {
    const match = analyzeResume(jobText, body.resume);
    const fit = scoreJobFit(jobText.slice(0, 12000), body.resume);
    return Response.json({ match: { ...match, score: fit.score, parts: fit.parts } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not compare the posting and the resume.";
    return Response.json({ error: message }, { status: 500 });
  }
}
