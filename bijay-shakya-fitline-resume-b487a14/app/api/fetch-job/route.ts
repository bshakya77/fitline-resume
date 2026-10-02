import { htmlToText, isPrivateHost, looksLikeBlockedPage } from "@/lib/html-text";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 1_500_000;

function fail(message: string, status = 422) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return fail("Send a job link to fetch.");
  }
  const raw = body.url?.trim() ?? "";
  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return fail("Enter a full link, including http:// or https://.");
  }
  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return fail("Use an http or https link, or paste the posting into the text box.");
  }
  if (isPrivateHost(target.hostname)) {
    return fail("That link points at a private address. Paste the job description instead.");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(target, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept: "text/html,application/xhtml+xml,text/plain;q=0.9",
        "User-Agent":
          "Mozilla/5.0 (compatible; Fitline/1.0; +https://localhost) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    });
    const finalUrl = new URL(response.url);
    if (isPrivateHost(finalUrl.hostname)) {
      return fail("That link redirected to a private address. Paste the job description instead.");
    }
    if (!response.ok) {
      return fail(
        `The site returned ${response.status} and did not share the posting. Paste the description into the text box.`,
      );
    }
    const type = response.headers.get("content-type") ?? "";
    if (type && !/text\/html|text\/plain|application\/xhtml|application\/xml/i.test(type)) {
      return fail("That link is not a readable job page. Paste the posting into the text box.");
    }
    const reader = response.body?.getReader();
    if (!reader) return fail("The site sent an empty response. Paste the posting into the text box.");
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > MAX_BYTES) {
        await reader.cancel();
        return fail("That page is too large to read as a job posting. Paste the description instead.");
      }
      chunks.push(value);
    }
    const html = new TextDecoder().decode(Buffer.concat(chunks));
    const text = /text\/plain/i.test(type) ? html.trim() : htmlToText(html);
    if (looksLikeBlockedPage(finalUrl.hostname, text)) {
      return fail("The site blocked the fetch, often with a login wall. Paste the posting into the text box.");
    }
    if (text.length < 80) {
      return fail("The page did not include a readable job description. Paste the posting into the text box.");
    }
    return Response.json({ text: text.slice(0, 50000) });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return fail("The fetch timed out. Paste the posting into the text box.");
    }
    return fail("Could not reach that link. Paste the posting into the text box.");
  } finally {
    clearTimeout(timer);
  }
}
