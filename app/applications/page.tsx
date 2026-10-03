import type { Metadata } from "next";
import { ApplicationsView } from "@/components/applications-view";

export const metadata: Metadata = {
  title: "Applications · Fitline",
  description: "Saved and applied jobs.",
};

export default function ApplicationsPage() {
  return <ApplicationsView />;
}
