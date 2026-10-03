"use client";

import { useEffect, useState } from "react";
import {
  loadApplications,
  saveApplications,
  withStatus,
  type ApplicationStatus,
  type JobSnapshot,
  type TrackedApplication,
} from "@/lib/applications";

export function useApplications() {
  const [applications, setApplications] = useState<TrackedApplication[] | null>(null);

  useEffect(() => {
    setApplications(loadApplications());
  }, []);

  useEffect(() => {
    if (applications === null) return;
    saveApplications(applications);
  }, [applications]);

  function setJobStatus(job: JobSnapshot, status: ApplicationStatus) {
    setApplications((current) => withStatus(current ?? loadApplications(), job, status));
  }

  return { applications: applications ?? [], setJobStatus };
}
