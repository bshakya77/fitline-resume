import { compileTex } from "@/lib/compile";
import { insertAcceptedBullets, previewRoles, rebuildFromPdf } from "@/lib/generate-tex";
import type { AcceptedBullet, ParsedResume } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { resume?: ParsedResume; accepted?: AcceptedBullet[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Send the resume and the accepted bullets." }, { status: 400 });
  }
  const resume = body.resume;
  const accepted = (body.accepted ?? [])
    .map((item) => ({
      roleId: item.roleId,
      skillLabel: item.skillLabel,
      bullet: item.bullet?.replace(/\s+/g, " ").trim() ?? "",
    }))
    .filter((item) => item.bullet && item.roleId);

  if (!resume?.source || (resume.sourceType !== "tex" && resume.sourceType !== "pdf")) {
    return Response.json({ error: "Upload a resume before generating." }, { status: 400 });
  }
  if (!accepted.length) {
    return Response.json({ error: "Accept at least one bullet before generating." }, { status: 400 });
  }
  if (accepted.some((item) => !item.bullet)) {
    return Response.json(
      { error: "One accepted bullet is empty. Write a sentence or skip it." },
      { status: 400 },
    );
  }
  const known = new Set(resume.roles.map((role) => role.id));
  if (accepted.some((item) => !known.has(item.roleId))) {
    return Response.json(
      { error: "One of the accepted bullets points at a role that is not in this resume." },
      { status: 400 },
    );
  }

  let tex: string;
  try {
    tex =
      resume.sourceType === "tex"
        ? insertAcceptedBullets(resume.source, resume.roles, accepted)
        : rebuildFromPdf(resume, accepted);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not write the bullets into the resume.";
    return Response.json({ error: message }, { status: 422 });
  }

  const compiled = await compileTex(tex);
  const note =
    resume.sourceType === "pdf"
      ? "This file was rebuilt from the PDF text in a Times layout. The original PDF layout is not preserved. Upload the .tex file when you need the current formatting kept."
      : "Accepted bullets were inserted as \\item lines inside the chosen role. The rest of the file is unchanged.";

  return Response.json({
    tex,
    pdfBase64: compiled.pdf ? compiled.pdf.toString("base64") : null,
    compileError: compiled.error,
    previewRoles: previewRoles(resume, accepted),
    fromPdf: resume.sourceType === "pdf",
    note,
  });
}
