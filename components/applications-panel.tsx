"use client";

import { Button } from "@/components/ui/button";
import type { ApplicationStatus, JobSnapshot, TrackedApplication } from "@/lib/applications";

function JobGroup({
  title,
  jobs,
  empty,
  onStatus,
}: {
  title: string;
  jobs: TrackedApplication[];
  empty: string;
  onStatus: (job: JobSnapshot, status: ApplicationStatus) => void;
}) {
  return (
    <section className="mt-8">
      <h2 className="flex items-baseline gap-2 font-heading text-xl font-semibold">
        {title}
        <span className="text-sm font-medium text-muted-foreground">{jobs.length}</span>
      </h2>
      {jobs.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {jobs.map((job) => (
            <li key={job.url} className="rounded-2xl border border-border bg-card p-4">
              <a
                href={job.url}
                target="_blank"
                rel="noreferrer"
                className="font-medium break-words underline-offset-4 hover:underline"
              >
                {job.title}
              </a>
              <p className="mt-2 text-sm break-words text-muted-foreground">
                {[job.organization, job.location, job.portal].filter(Boolean).join(" · ")}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={job.status === "saved" ? "default" : "secondary"}
                  aria-pressed={job.status === "saved"}
                  onClick={() => onStatus(job, "saved")}
                >
                  {job.status === "saved" ? "Saved" : "Save"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={job.status === "applied" ? "default" : "secondary"}
                  aria-pressed={job.status === "applied"}
                  onClick={() => onStatus(job, "applied")}
                >
                  Applied
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function ApplicationsPanel({
  applications,
  onStatus,
}: {
  applications: TrackedApplication[];
  onStatus: (job: JobSnapshot, status: ApplicationStatus) => void;
}) {
  const saved = applications.filter((job) => job.status === "saved");
  const applied = applications.filter((job) => job.status === "applied");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="font-heading text-4xl font-bold tracking-tight">Applications</h1>
      <p className="mt-2 text-sm text-muted-foreground">Jobs you saved or marked as applied.</p>
      <JobGroup title="Saved" jobs={saved} empty="No saved jobs yet." onStatus={onStatus} />
      <JobGroup title="Applied" jobs={applied} empty="No applied jobs yet." onStatus={onStatus} />
    </div>
  );
}
