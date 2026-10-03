import { htmlToText, isPrivateHost, looksLikeBlockedPage } from "@/lib/html-text";
import { keepScoredListing } from "@/lib/job-filter";
import { scoreJobFit, type JobScoreParts } from "@/lib/job-score";
import type { ParsedResume } from "@/lib/types";

export type PortalJob = {
  portal: string;
  title: string;
  organization: string | null;
  location: string | null;
  url: string;
  /** Posting text passed to the scorer, or empty when the listing has no description. */
  text: string;
  score: number | null;
  parts: JobScoreParts | null;
};

export type PortalSearchResult = {
  jobs: PortalJob[];
  empty: string[];
  noneQualified: boolean;
};

const ALLOWED = ["LinkedIn", "Monster.com", "Y Combinator", "HigherEdJobs", "SDBOR"] as const;

type PortalName = (typeof ALLOWED)[number];

type RawListing = {
  title: string;
  organization: string | null;
  location: string | null;
  url: string;
  text: string;
  /** Requirements and description used for scoring. Empty when the listing has none. */
  body: string;
};

const HEADERS = {
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9",
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
};

function clean(value: string): string {
  return htmlToText(value).replace(/\s+/g, " ").trim();
}

function publicUrl(raw: string): string | null {
  try {
    const url = new URL(raw.replace(/&amp;/g, "&"));
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (isPrivateHost(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

async function fetchText(url: string): Promise<{ ok: boolean; status: number; body: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, { redirect: "follow", signal: controller.signal, headers: HEADERS });
    if (!response.ok) return { ok: false, status: response.status, body: "" };
    const body = (await response.text()).slice(0, 1_500_000);
    return { ok: true, status: response.status, body };
  } catch {
    return { ok: false, status: 0, body: "" };
  } finally {
    clearTimeout(timer);
  }
}

function parseLinkedInCards(html: string): RawListing[] {
  const jobs: RawListing[] = [];
  for (const block of html.split(/<li\b/i).slice(1)) {
    const href = /base-card__full-link[^>]*href="([^"]+)"/i.exec(block)?.[1];
    const title = clean(/base-search-card__title[^>]*>([\s\S]*?)<\/h3>/i.exec(block)?.[1] ?? "");
    const organization = clean(
      /base-search-card__subtitle[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i.exec(block)?.[1] ??
        /base-search-card__subtitle[^>]*>([\s\S]*?)<\/h4>/i.exec(block)?.[1] ??
        "",
    );
    const location = clean(/job-search-card__location[^>]*>([\s\S]*?)<\/span>/i.exec(block)?.[1] ?? "");
    const url = href ? publicUrl(href) : null;
    if (!title || !url || !url.includes("linkedin.com/jobs/view/")) continue;
    const id = /urn:li:jobPosting:(\d+)/.exec(block)?.[1] ?? /jobs\/view\/[^"?]*-(\d+)/.exec(url)?.[1] ?? "";
    jobs.push({
      title,
      organization: organization || null,
      location: location || null,
      url,
      text: id ? `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${id}` : "",
      body: "",
    });
    if (jobs.length >= 8) break;
  }
  return jobs;
}

async function linkedInJobs(query: string): Promise<RawListing[]> {
  const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent("United States")}&start=0`;
  const page = await fetchText(url);
  if (!page.ok || !page.body.includes("base-search-card__title")) return [];
  const cards = parseLinkedInCards(page.body);
  await Promise.all(
    cards.map(async (card) => {
      if (!card.text.startsWith("http")) {
        card.text = `${card.title}\n${card.organization ?? ""}\n${card.location ?? ""}`;
        card.body = "";
        return;
      }
      const detail = await fetchText(card.text);
      const marker = detail.body.indexOf("show-more-less-html__markup");
      const openEnd = marker >= 0 ? detail.body.indexOf(">", marker) : -1;
      const description = openEnd >= 0 ? clean(detail.body.slice(openEnd + 1, openEnd + 1 + 12000)) : "";
      card.body = description;
      card.text = [card.title, card.organization, card.location, description].filter(Boolean).join("\n");
    }),
  );
  return cards;
}

function blocked(hostname: string, body: string): boolean {
  if (/_Incapsula_Resource|just a moment|cf-browser-verification/i.test(body)) return true;
  return looksLikeBlockedPage(hostname, htmlToText(body));
}

function monsterLocation(value: unknown): string {
  if (!value || typeof value !== "object") return "United States";
  const place = value as Record<string, unknown>;
  const address = place.address && typeof place.address === "object" ? (place.address as Record<string, unknown>) : place;
  const locality = typeof address.addressLocality === "string" ? address.addressLocality.trim() : "";
  const region = typeof address.addressRegion === "string" ? address.addressRegion.trim() : "";
  const joined = [locality, region].filter(Boolean).join(", ");
  return joined || "United States";
}

function addMonsterPosting(value: unknown, jobs: RawListing[], seen: Set<string>) {
  if (jobs.length >= 8 || !value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const item of value) addMonsterPosting(item, jobs, seen);
    return;
  }
  const record = value as Record<string, unknown>;
  if (record["@graph"]) addMonsterPosting(record["@graph"], jobs, seen);
  const type = record["@type"];
  const types = Array.isArray(type) ? type : [type];
  if (!types.includes("JobPosting")) return;
  const title = typeof record.title === "string" ? clean(record.title) : "";
  const rawUrl = typeof record.url === "string" ? record.url : "";
  const url = rawUrl ? publicUrl(rawUrl.startsWith("http") ? rawUrl : `https://www.monster.com${rawUrl}`) : null;
  if (!title || !url || seen.has(url)) return;
  const hiring = record.hiringOrganization;
  const organization =
    hiring && typeof hiring === "object" && typeof (hiring as Record<string, unknown>).name === "string"
      ? clean((hiring as Record<string, unknown>).name as string)
      : "";
  const description = typeof record.description === "string" ? clean(record.description) : "";
  const location = monsterLocation(record.jobLocation);
  seen.add(url);
  jobs.push({
    title,
    organization: organization || null,
    location,
    url,
    text: [title, organization, location, description].filter(Boolean).join("\n"),
    body: description,
  });
}

async function monsterJobs(query: string): Promise<RawListing[]> {
  const page = await fetchText(
    `https://www.monster.com/jobs/search?q=${encodeURIComponent(query)}&where=${encodeURIComponent("United States")}&page=1`,
  );
  if (!page.ok || blocked("www.monster.com", page.body)) return [];
  const jobs: RawListing[] = [];
  const seen = new Set<string>();
  for (const block of page.body.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      addMonsterPosting(JSON.parse(block[1]) as unknown, jobs, seen);
    } catch {
      /* Skip a script block that is not JSON. */
    }
    if (jobs.length >= 8) return jobs;
  }
  for (const anchor of page.body.matchAll(/<a\b[^>]*href=["']([^"']*\/job-openings\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = anchor[1].startsWith("http") ? anchor[1] : `https://www.monster.com${anchor[1]}`;
    const url = publicUrl(href);
    const title = clean(anchor[2]);
    if (!url || !title || title.length < 4 || title.length > 160 || seen.has(url)) continue;
    seen.add(url);
    jobs.push({ title, organization: null, location: "United States", url, text: title, body: "" });
    if (jobs.length >= 8) break;
  }
  return jobs;
}

function decodeMarkup(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

async function sdBorJobs(query: string): Promise<RawListing[]> {
  const page = await fetchText(
    `https://yourfuture.sdbor.edu/postings/search.atom?query=${encodeURIComponent(query)}`,
  );
  if (!page.ok || blocked("yourfuture.sdbor.edu", page.body) || !page.body.includes("<entry")) return [];
  const jobs: RawListing[] = [];
  for (const entry of page.body.split(/<entry\b/i).slice(1)) {
    const title = clean(/<title>([\s\S]*?)<\/title>/i.exec(entry)?.[1] ?? "");
    const href =
      /<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i.exec(entry)?.[1] ??
      /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']alternate["']/i.exec(entry)?.[1];
    const url = href ? publicUrl(href) : null;
    const organization = clean(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>/i.exec(entry)?.[1] ?? "");
    const description = clean(decodeMarkup(/<content[^>]*>([\s\S]*?)<\/content>/i.exec(entry)?.[1] ?? ""));
    if (!title || !url || !/yourfuture\.sdbor\.edu\/postings\/\d+/i.test(url)) continue;
    jobs.push({
      title,
      organization: organization || null,
      location: "South Dakota",
      url,
      text: [title, organization, "South Dakota", description].filter(Boolean).join("\n"),
      body: description,
    });
    if (jobs.length >= 8) break;
  }
  return jobs;
}

async function higherEdJobs(query: string): Promise<RawListing[]> {
  const page = await fetchText(
    `https://www.higheredjobs.com/search/advanced_action.cfm?Keyword=${encodeURIComponent(query)}`,
  );
  if (!page.ok || blocked("www.higheredjobs.com", page.body)) return [];
  const jobs: RawListing[] = [];
  for (const anchor of page.body.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const href = /href=["']([^"']+)["']/i.exec(anchor[1])?.[1];
    let url: string | null = null;
    try {
      url = href
        ? publicUrl(new URL(href.replace(/&amp;/g, "&"), "https://www.higheredjobs.com").toString())
        : null;
    } catch {
      url = null;
    }
    const title = clean(anchor[2]);
    if (!url || !/higheredjobs\.com\/(?:faculty|admin|executive|details)\/details\.cfm/i.test(url)) continue;
    if (title.length < 8 || title.length > 160) continue;
    jobs.push({ title, organization: null, location: "United States", url, text: title, body: "" });
    if (jobs.length >= 8) break;
  }
  return jobs;
}

const US_STATE =
  "(?:AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)";

function inUnitedStates(location: string): boolean {
  if (/\b(?:United States|USA)\b|, US\b|\(US\)/i.test(location)) return true;
  if (
    /\b(?:India|England|United Kingdom|France|Japan|Germany|Canada|Singapore|Bengaluru|Bangalore|Pune|London|Paris|Tokyo|Mumbai)\b/i.test(
      location,
    )
  ) {
    return false;
  }
  if (/, IN\b/.test(location)) return false;
  if (new RegExp(`,\\s*${US_STATE}\\b`).test(location)) return true;
  return /\b(?:San Francisco|New York|Mountain View|Los Angeles|Boston|Seattle|Austin|Chicago|SF Headquarters)\b/i.test(
    location,
  );
}

function ycProps(html: string): Record<string, unknown> | null {
  const raw = /data-page="([^"]+)"/.exec(html)?.[1];
  if (!raw) return null;
  try {
    const decoded = raw
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&#39;|&apos;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
    const data = JSON.parse(decoded) as { props?: Record<string, unknown> };
    return data.props ?? null;
  } catch {
    return null;
  }
}

async function yCombinatorJobs(query: string): Promise<RawListing[]> {
  const page = await fetchText(
    `https://www.workatastartup.com/jobs/search?q=${encodeURIComponent(query)}`,
  );
  if (!page.ok || blocked("www.workatastartup.com", page.body)) return [];
  let payload: { jobs?: unknown };
  try {
    payload = JSON.parse(page.body) as { jobs?: unknown };
  } catch {
    return [];
  }
  if (!Array.isArray(payload.jobs)) return [];
  const jobs: RawListing[] = [];
  for (const item of payload.jobs) {
    if (!item || typeof item !== "object") continue;
    const job = item as Record<string, unknown>;
    const title = typeof job.title === "string" ? job.title.trim() : "";
    const id = typeof job.id === "number" ? job.id : null;
    const location = typeof job.location === "string" ? job.location.trim() : "";
    const organization = typeof job.companyName === "string" ? job.companyName.trim() : "";
    const blurb = typeof job.companyOneLiner === "string" ? job.companyOneLiner.trim() : "";
    if (!title || id === null || !inUnitedStates(location)) continue;
    const url = publicUrl(`https://www.workatastartup.com/jobs/${id}`);
    if (!url) continue;
    jobs.push({
      title,
      organization: organization || null,
      location: location || null,
      url,
      text: [title, organization, location, blurb].filter(Boolean).join("\n"),
      body: "",
    });
    if (jobs.length >= 8) break;
  }
  await Promise.all(
    jobs.map(async (job) => {
      const detail = await fetchText(job.url);
      const props = detail.ok ? ycProps(detail.body) : null;
      const posting = props && typeof props.job === "object" && props.job ? (props.job as Record<string, unknown>) : null;
      const description = typeof posting?.descriptionHtml === "string" ? clean(posting.descriptionHtml) : "";
      if (description) {
        job.body = description;
        job.text = [job.text, description].filter(Boolean).join("\n");
      }
    }),
  );
  return jobs;
}

function scoreJob(job: RawListing, portal: string, resume: ParsedResume | null): PortalJob {
  const scoredText = job.text.slice(0, 12000);
  const fit = resume ? scoreJobFit(scoredText, resume) : null;
  return {
    portal,
    title: job.title,
    organization: job.organization,
    location: job.location,
    url: job.url,
    text: job.body.trim() ? scoredText : "",
    score: fit?.score ?? null,
    parts: fit?.parts ?? null,
  };
}

export async function searchPortals(
  query: string,
  portals: string[],
  resume: ParsedResume | null,
): Promise<PortalSearchResult> {
  const chosen = ALLOWED.filter((name) => portals.includes(name));
  const empty: string[] = [];
  const jobs: PortalJob[] = [];
  let fetched = 0;
  const fetchers: Record<PortalName, (query: string) => Promise<RawListing[]>> = {
    LinkedIn: linkedInJobs,
    "Monster.com": monsterJobs,
    "Y Combinator": yCombinatorJobs,
    HigherEdJobs: higherEdJobs,
    SDBOR: sdBorJobs,
  };
  const found = await Promise.all(
    chosen.map(async (portal) => ({ portal, jobs: await fetchers[portal](query) })),
  );
  for (const item of found) {
    if (item.jobs.length === 0) {
      empty.push(item.portal);
      continue;
    }
    fetched += item.jobs.length;
    for (const job of item.jobs) {
      const scored = scoreJob(job, item.portal, resume);
      if (!keepScoredListing(scored.score, job.text)) continue;
      jobs.push(scored);
    }
  }
  jobs.sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || a.title.localeCompare(b.title));
  return { jobs, empty, noneQualified: fetched > 0 && jobs.length === 0 };
}
