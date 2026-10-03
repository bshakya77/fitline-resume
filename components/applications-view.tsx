"use client";

import { ApplicationsPanel } from "@/components/applications-panel";
import { SiteHeader } from "@/components/site-header";
import { useApplications } from "@/components/use-applications";

export function ApplicationsView() {
  const { applications, setJobStatus } = useApplications();

  return (
    <div className="min-h-full overflow-x-hidden bg-background text-foreground">
      <SiteHeader />
      <main>
        <ApplicationsPanel applications={applications} onStatus={setJobStatus} />
      </main>
    </div>
  );
}
