"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApplicationStatus, JobSnapshot, TrackedApplication } from "@/lib/applications";
import type { ParsedResume } from "@/lib/types";
import { cn } from "@/lib/utils";

const PORTALS = ["LinkedIn", "Monster.com", "Y Combinator", "HigherEdJobs", "SDBOR"] as const;

function postedLabel(postedAt: number | null): string | null {
  if (postedAt === null) return null;
  const posted = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Chicago",
  }).format(postedAt);
  return `Posted ${posted}`;
}

type Listing = {
  portal: string;
  title: string;
  organization: string | null;
  location: string | null;
  url: string;
  text: string;
  excerpt: string;
  score: number | null;
  parts: { keywords: number; technologies: number; experience: number } | null;
  postedAt: number | null;
};

export function MatchingJobs({
  resume,
  applications,
  onStatus,
}: {
  resume: ParsedResume | null;
  applications: TrackedApplication[];
  onStatus: (job: JobSnapshot, status: ApplicationStatus) => void;
}) {
  const [keywords, setKeywords] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [empty, setEmpty] = useState<string[]>([]);
  const [noneQualified, setNoneQualified] = useState(false);
  const [noneRecent, setNoneRecent] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);

  async function copyValue(value: string, key: string, kind: "link" | "description") {
    const setError = kind === "link" ? setLinkError : setDescriptionError;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard");
      await navigator.clipboard.writeText(value);
      setError((current) => (current === key ? null : current));
    } catch {
      setError(key);
    }
  }

  const allSelected = PORTALS.every((name) => selected.includes(name));

  function toggle(name: string) {
    setSelected((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    );
  }

  function toggleAll() {
    setSelected(allSelected ? [] : [...PORTALS]);
  }

  async function search() {
    if (keywords.trim().length < 2 || selected.length === 0) return;
    setSearching(true);
    setSearched(true);
    setError(null);
    setListings([]);
    setEmpty([]);
    setNoneQualified(false);
    setNoneRecent(false);
    try {
      const response = await fetch("/api/portal-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: keywords.trim(), portals: selected, resume }),
      });
      const data = (await response.json()) as {
        jobs?: Listing[];
        empty?: string[];
        noneQualified?: boolean;
        noneRecent?: boolean;
        error?: string;
      };
      if (!response.ok) {
        setError(data.error || "Search did not finish.");
        return;
      }
      setListings(Array.isArray(data.jobs) ? data.jobs : []);
      setEmpty(Array.isArray(data.empty) ? data.empty : []);
      setNoneQualified(data.noneQualified === true);
      setNoneRecent(data.noneRecent === true);
    } catch {
      setError("Search did not finish.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div id="jobs" className="min-w-0">
      <form
        className="flex flex-row flex-nowrap items-center gap-2 rounded-2xl border border-border bg-card p-3 shadow-[0_10px_30px_-18px_rgba(90,60,170,0.45)]"
        onSubmit={(event) => {
          event.preventDefault();
          void search();
        }}
      >
        <div className="min-w-0 flex-1">
          <Label htmlFor="job-query" className="sr-only">
            Keywords
          </Label>
          <Input
            id="job-query"
            value={keywords}
            onChange={(event) => setKeywords(event.target.value)}
            placeholder="Job title, keyword"
            className="min-h-11 rounded-xl bg-background"
          />
        </div>
        <div className="w-[9.25rem] shrink-0">
          <Label htmlFor="job-place" className="sr-only">
            Country
          </Label>
          <Input id="job-place" value="United States" readOnly className="min-h-11 rounded-xl bg-secondary px-2 text-center" />
        </div>
        <Button type="submit" className="shrink-0 px-4" disabled={keywords.trim().length < 2 || selected.length === 0}>
          Search
        </Button>
      </form>
      <ul className="portal-picks mt-3">
        <li className="min-w-0">
          <label
            className={cn(
              "flex min-h-10 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border bg-card px-2 py-1.5 text-center",
              allSelected ? "border-primary bg-secondary" : "border-border",
            )}
          >
            <input
              type="checkbox"
              name="portals"
              value="All"
              checked={allSelected}
              onChange={toggleAll}
              className="size-3.5 shrink-0 accent-[#6e4ad4]"
            />
            <span className="min-w-0 font-heading text-[11px] leading-tight font-semibold sm:text-xs">All</span>
          </label>
        </li>
        {PORTALS.map((name) => {
          const on = selected.includes(name);
          return (
            <li key={name} className="min-w-0">
              <label
                className={cn(
                  "flex min-h-10 min-w-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border bg-card px-2 py-1.5 text-center",
                  on ? "border-primary bg-secondary" : "border-border",
                )}
              >
                <input
                  type="checkbox"
                  name="portals"
                  value={name}
                  checked={on}
                  onChange={() => toggle(name)}
                  className="size-3.5 shrink-0 accent-[#6e4ad4]"
                />
                <span className="min-w-0 font-heading text-[11px] leading-tight font-semibold sm:text-xs">{name}</span>
              </label>
            </li>
          );
        })}
      </ul>
      {searching ? <p className="mt-4 text-sm text-muted-foreground">Searching…</p> : null}
      {error ? <p className="mt-4 text-sm text-muted-foreground">{error}</p> : null}
      {searched && !resume ? <p className="mt-4 text-sm text-muted-foreground">Scores need a resume.</p> : null}
      {empty.map((name) => (
        <p key={name} className="mt-2 text-sm text-muted-foreground">
          {name} returned nothing.
        </p>
      ))}
      {searched && noneRecent ? (
        <p className="mt-4 text-sm text-muted-foreground">
          None of the listings were posted in the last month.
        </p>
      ) : null}
      {searched && noneQualified ? (
        <p className="mt-4 text-sm text-muted-foreground">
          None of the listings scored 10 or higher without a citizenship or green-card requirement.
        </p>
      ) : null}
      {listings.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-3">
          {listings.map((job) => {
            const rowKey = `${job.portal}:${job.url}`;
            const description = job.excerpt?.trim() ?? "";
            const status = applications.find((item) => item.url === job.url)?.status ?? null;
            return (
            <li key={rowKey} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <a href={job.url} target="_blank" rel="noreferrer" className="min-w-0 font-medium break-words underline-offset-4 hover:underline">
                  {job.title}
                </a>
                {job.score !== null ? (
                  <p className="shrink-0 font-heading text-2xl leading-none">
                    {job.score}
                    <span className="ml-1 text-xs text-muted-foreground">/100</span>
                  </p>
                ) : null}
              </div>
              {job.parts ? (
                <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>Keywords {job.parts.keywords}</span>
                  <span>Technologies {job.parts.technologies}</span>
                  <span>Experience {job.parts.experience}</span>
                </p>
              ) : null}
              <p className="mt-2 text-sm break-words text-muted-foreground">
                {[postedLabel(job.postedAt), job.organization, job.location, job.portal].filter(Boolean).join(" · ")}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={status === "saved" ? "default" : "secondary"}
                  aria-pressed={status === "saved"}
                  onClick={() => onStatus(job, "saved")}
                >
                  {status === "saved" ? "Saved" : "Save"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={status === "applied" ? "default" : "secondary"}
                  aria-pressed={status === "applied"}
                  onClick={() => onStatus(job, "applied")}
                >
                  Applied
                </Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => void copyValue(job.url, rowKey, "link")}>
                  Copy link
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={description.length === 0}
                  onClick={() => void copyValue(description, rowKey, "description")}
                >
                  Copy description
                </Button>
                {linkError === rowKey ? (
                  <p className="text-xs text-muted-foreground">Could not copy the link.</p>
                ) : null}
                {descriptionError === rowKey ? (
                  <p className="text-xs text-muted-foreground">Could not copy the description.</p>
                ) : null}
              </div>
            </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
