"use client";

import { useEffect, useState } from "react";
import { JobPanel } from "@/components/job-panel";
import { MatchPanel } from "@/components/match-panel";
import { MatchingJobs } from "@/components/matching-jobs";
import { ResumePanel } from "@/components/resume-panel";
import { Suggestions } from "@/components/suggestions";
import type { MatchResult } from "@/lib/analyze";
import type { ParsedResume } from "@/lib/types";

async function errorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    if (data.error) return data.error;
  } catch {
    /* The body was not JSON. */
  }
  return fallback;
}

export function FitApp() {
  const [jobUrl, setJobUrl] = useState("");
  const [jobText, setJobText] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [resume, setResume] = useState<ParsedResume | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const [match, setMatch] = useState<MatchResult | null>(null);
  const [scoring, setScoring] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);

  const ready = Boolean(resume && jobText.trim().length >= 20);

  useEffect(() => {
    if (!resume || jobText.trim().length < 20) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      void (async () => {
        setScoring(true);
        setScoreError(null);
        try {
          const response = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jobText, resume }),
            signal: controller.signal,
          });
          if (!response.ok) {
            setMatch(null);
            setScoreError(await errorMessage(response, "Could not score the match."));
            return;
          }
          const data = (await response.json()) as { match: MatchResult };
          setMatch(data.match);
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setMatch(null);
          setScoreError("Could not score the match.");
        } finally {
          if (!controller.signal.aborted) setScoring(false);
        }
      })();
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [jobText, resume]);

  async function fetchJob() {
    setFetching(true);
    setFetchError(null);
    try {
      const response = await fetch("/api/fetch-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jobUrl }),
      });
      if (!response.ok) {
        setFetchError(await errorMessage(response, "Could not fetch that link."));
        return;
      }
      const data = (await response.json()) as { text: string };
      setJobText(data.text);
      if (data.text.trim().length < 20) {
        setMatch(null);
        setScoreError(null);
        setScoring(false);
      }
    } catch {
      setFetchError("Could not reach the fetch service. Paste the posting into the text box.");
    } finally {
      setFetching(false);
    }
  }

  async function uploadResume(file: File) {
    setParsing(true);
    setParseError(null);
    setMatch(null);
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch("/api/parse", { method: "POST", body: form });
      if (!response.ok) {
        setResume(null);
        setParseError(await errorMessage(response, "Could not read that resume."));
        return;
      }
      const data = (await response.json()) as { resume: ParsedResume };
      setResume(data.resume);
    } catch {
      setResume(null);
      setParseError("Could not read that resume.");
    } finally {
      setParsing(false);
    }
  }

  return (
    <div className="min-h-full overflow-x-hidden bg-background text-foreground">
      <header className="bg-secondary">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 sm:px-6">
          <a href="#top" className="flex items-center gap-2 font-heading text-lg font-semibold">
            <span className="grid size-9 place-items-center rounded-full bg-primary text-sm text-primary-foreground">F</span>
            Fitline
          </a>
          <nav className="flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium">
            <a href="#resume">Resume</a>
            <a href="#score">Score</a>
            <a href="#jobs">Jobs</a>
          </nav>
        </div>
      </header>
      <main id="top">
        <section className="relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute -top-16 -left-16 size-56 rounded-full bg-[#efe8ff]" />
          <div aria-hidden className="pointer-events-none absolute -top-10 right-0 size-48 rounded-full bg-[#e4dcff]" />
          <div className="relative mx-auto max-w-6xl px-4 pt-12 pb-6 sm:px-6 sm:pt-16 sm:pb-10">
            <h1 className="max-w-3xl font-heading text-4xl leading-tight font-bold tracking-tight sm:text-6xl">
              Score your <span className="text-gradient">resume</span>
            </h1>
            <div className="mt-8">
              <MatchingJobs resume={resume} />
            </div>
          </div>
        </section>
        <section className="mx-auto grid w-full max-w-6xl grid-cols-1 items-start gap-4 px-4 py-4 sm:px-6 sm:py-6 min-[800px]:grid-cols-2 min-[800px]:gap-6">
          <JobPanel
            url={jobUrl}
            text={jobText}
            loading={fetching}
            error={fetchError}
            onUrl={setJobUrl}
            onText={(value) => {
              setJobText(value);
              if (value.trim().length < 20) {
                setMatch(null);
                setScoreError(null);
                setScoring(false);
              }
            }}
            onFetch={() => void fetchJob()}
          />
          <div id="resume" className="min-w-0">
            <ResumePanel
              resume={resume}
              loading={parsing}
              error={parseError}
              onFile={(file) => void uploadResume(file)}
            />
          </div>
          <div id="score" className="min-w-0 min-[800px]:col-span-2">
            <MatchPanel match={match} loading={scoring} error={scoreError} ready={ready} />
          </div>
          {match && match.score !== null ? (
            <div className="min-w-0 min-[800px]:col-span-2">
              <Suggestions groups={match.suggestions} covered={match.missing.length === 0} />
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
