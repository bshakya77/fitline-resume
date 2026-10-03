export type ApplicationStatus = "saved" | "applied";

export type JobSnapshot = {
  portal: string;
  title: string;
  organization: string | null;
  location: string | null;
  url: string;
};

export type TrackedApplication = JobSnapshot & {
  status: ApplicationStatus;
  updatedAt: number;
};

const STORAGE_KEY = "fitline.applications.v1";

function isTrackedApplication(value: unknown): value is TrackedApplication {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.url === "string" &&
    item.url.length > 0 &&
    typeof item.title === "string" &&
    typeof item.portal === "string" &&
    (item.organization === null || typeof item.organization === "string") &&
    (item.location === null || typeof item.location === "string") &&
    (item.status === "saved" || item.status === "applied") &&
    typeof item.updatedAt === "number"
  );
}

export function loadApplications(): TrackedApplication[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isTrackedApplication).map((item) => ({
      portal: item.portal,
      title: item.title,
      organization: item.organization,
      location: item.location,
      url: item.url,
      status: item.status,
      updatedAt: item.updatedAt,
    }));
  } catch {
    return [];
  }
}

export function saveApplications(applications: TrackedApplication[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
}

/** Sets a job to the chosen status, or clears it when that status is already active. */
export function withStatus(
  applications: TrackedApplication[],
  job: JobSnapshot,
  status: ApplicationStatus,
): TrackedApplication[] {
  const existing = applications.find((item) => item.url === job.url);
  if (existing?.status === status) {
    return applications.filter((item) => item.url !== job.url);
  }
  const next: TrackedApplication = {
    portal: job.portal,
    title: job.title,
    organization: job.organization,
    location: job.location,
    url: job.url,
    status,
    updatedAt: Date.now(),
  };
  if (existing) {
    return applications.map((item) => (item.url === job.url ? next : item));
  }
  return [next, ...applications];
}
