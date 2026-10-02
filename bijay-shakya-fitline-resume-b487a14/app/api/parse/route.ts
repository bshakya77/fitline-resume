import { parsePdf } from "@/lib/parse-pdf";
import { parseTex } from "@/lib/parse-tex";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 8_000_000;

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Upload a .tex or .pdf file." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Upload a .tex or .pdf file." }, { status: 400 });
  }
  const name = file.name || "resume";
  const lower = name.toLowerCase();
  const isTex = lower.endsWith(".tex");
  const isPdf = lower.endsWith(".pdf") || file.type === "application/pdf";
  if (!isTex && !isPdf) {
    return Response.json({ error: "Upload a .tex or .pdf file." }, { status: 400 });
  }
  if (file.size === 0) {
    return Response.json({ error: "That file is empty." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "That file is larger than 8 MB. Upload a shorter resume." }, { status: 400 });
  }
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const resume = isTex ? parseTex(new TextDecoder().decode(bytes), name) : await parsePdf(bytes, name);
    if (!resume.plainText.trim()) {
      return Response.json(
        { error: "No readable text was found in that file. Try the .tex source if you have it." },
        { status: 422 },
      );
    }
    return Response.json({ resume });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not read that file.";
    return Response.json({ error: message }, { status: 422 });
  }
}
