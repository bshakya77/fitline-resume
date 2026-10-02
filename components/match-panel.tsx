"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { MatchResult } from "@/lib/analyze";

export function MatchPanel({
  match,
  loading,
  error,
}: {
  match: MatchResult | null;
  loading: boolean;
  error: string | null;
  ready: boolean;
}) {
  const score = match?.score ?? null;
  const parts = match?.parts ?? null;
  const missing = match?.missing ?? [];
  const present = match?.present ?? [];
  const scored = score !== null && parts !== null;

  return (
    <section
      className="flex min-w-0 flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:p-7"
      aria-live="polite"
    >
      <div>
        <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Match score</p>
        {scored ? (
          <p className="mt-2 font-heading text-7xl leading-none tracking-tight text-foreground min-[800px]:text-8xl">
            {score}
            <span className="ml-2 align-baseline text-xl text-muted-foreground sm:text-2xl">/ 100</span>
          </p>
        ) : (
          <p className="mt-2 font-heading text-7xl leading-none tracking-tight text-foreground/20 min-[800px]:text-8xl">
            —
          </p>
        )}
        {loading && !scored ? <p className="mt-3 text-sm text-muted-foreground">Scoring…</p> : null}
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Could not score the match</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {match?.needsMoreJobText ? (
        <Alert>
          <AlertTitle>The score needs a fuller job description</AlertTitle>
          <AlertDescription>
            No skills or technical phrases turned up in that text. Paste the requirements and the tools.
          </AlertDescription>
        </Alert>
      ) : null}

      {scored ? (
        <>
          <dl className="grid grid-cols-2 gap-3 border-t border-border pt-4 sm:grid-cols-4">
            {(
              [
                ["Keywords", parts.keywords],
                ["Domain", parts.domain],
                ["Technologies", parts.technologies],
                ["Experience", parts.experience],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="font-heading text-3xl leading-none">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="border-t border-border pt-4">
            <h2 className="text-sm font-medium text-red-800">Missing from the resume</h2>
            {missing.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">None of the posting skills are missing.</p>
            ) : (
              <ul className="mt-3 flex flex-wrap gap-2">
                {missing.map((skill) => (
                  <li
                    key={skill.id}
                    className="max-w-full rounded-full bg-red-50 px-3 py-1.5 text-sm font-medium break-words text-red-800 ring-1 ring-red-200"
                  >
                    {skill.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {present.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              Already on the resume: {present.map((skill) => skill.label).join(", ")}.
            </p>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
