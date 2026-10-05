import { learningRoadmap, pilotProject } from "@/lib/learn";
import type { FoundSkill } from "@/lib/types";

export function LearningRoadmap({ skills }: { skills: FoundSkill[] }) {
  const steps = learningRoadmap(skills);
  const pilot = pilotProject(skills);
  if (steps.length === 0) {
    return (
      <section className="min-w-0" aria-labelledby="learning-roadmap">
        <h2 id="learning-roadmap" className="font-heading text-2xl font-semibold">
          Learning roadmap
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">Every listed technology is already on the resume.</p>
      </section>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <section className="rounded-2xl border border-border bg-card px-5 py-4 sm:px-6" aria-labelledby="learning-roadmap">
        <h2 id="learning-roadmap" className="font-heading text-lg font-semibold">
          Learning roadmap
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Highest priority first.</p>
        <ol className="mt-2">
          {steps.map((step, index) => (
            <li
              key={step.id}
              className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-t border-border/70 py-1.5 first:border-t-0"
            >
              <span className="text-sm">
                <span className="mr-2 tabular-nums text-muted-foreground">{index + 1}</span>
                {step.label}
              </span>
              <a
                href={step.href}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary underline-offset-2 hover:underline"
              >
                {step.title}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ol>
      </section>
      {pilot ? (
        <section className="rounded-2xl border border-border bg-card px-5 py-4 sm:px-6" aria-labelledby="pilot-project">
          <h2 id="pilot-project" className="font-heading text-lg font-semibold">
            Pilot project
          </h2>
          <h3 className="mt-3 text-sm font-medium">Theme</h3>
          <p className="text-sm font-medium">{pilot.theme}</p>
          <p className="text-sm text-muted-foreground">{pilot.detail}</p>
          <h3 className="mt-3 text-sm font-medium">How these technologies are used</h3>
          <dl className="mt-1">
            {pilot.uses.map((use) => (
              <div key={use.id} className="grid gap-x-3 border-t border-border/70 py-1.5 sm:grid-cols-[11rem_1fr]">
                <dt className="text-sm font-medium">{use.label}</dt>
                <dd className="text-sm text-muted-foreground">{use.how}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </div>
  );
}
