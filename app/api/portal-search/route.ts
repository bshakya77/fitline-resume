import { searchPortals } from "@/lib/portal-listings";
import type { ParsedResume } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { query?: string; portals?: string[]; resume?: ParsedResume | null };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Send keywords and the selected portals." }, { status: 400 });
  }
  const query = body.query?.trim() ?? "";
  if (query.length < 2) {
    return Response.json({ error: "Enter job-position keywords." }, { status: 400 });
  }
  const portals = Array.isArray(body.portals) ? body.portals.map(String) : [];
  const resume = body.resume?.plainText?.trim() && Array.isArray(body.resume.roles) ? body.resume : null;
  const result = await searchPortals(query.slice(0, 120), portals, resume);
  return Response.json(result);
}
