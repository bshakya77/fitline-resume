"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ParsedResume, ResumeSectionKind } from "@/lib/types";

const KIND_LABEL: Record<ResumeSectionKind, string> = {
  summary: "Summary",
  skills: "Skills",
  experience: "Experience",
  publications: "Publications",
  education: "Education",
  awards: "Awards",
  other: "Section",
};

function snippet(text: string, limit = 240): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= limit) return flat;
  return `${flat.slice(0, limit).trimEnd()}…`;
}

type Props = {
  resume: ParsedResume | null;
  loading: boolean;
  error: string | null;
  onFile: (file: File) => void;
};

export function ResumePanel({ resume, loading, error, onFile }: Props) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Resume</CardTitle>
        <CardDescription>Upload a .tex or PDF.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="resume-file">Resume file</Label>
          <Input
            id="resume-file"
            type="file"
            accept=".tex,.pdf,application/pdf,text/x-tex"
            className="min-h-11"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) onFile(file);
            }}
          />
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Reading the resume…
          </p>
        ) : null}
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Could not read the resume</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {!resume && !loading && !error ? (
          <p className="text-sm text-muted-foreground">No resume yet.</p>
        ) : null}
        {resume ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{resume.fileName}</Badge>
              <Badge variant="outline">{resume.sourceType === "tex" ? ".tex source" : "PDF text"}</Badge>
              <span className="text-sm text-muted-foreground">
                {resume.sections.length} sections · {resume.roles.length} roles
              </span>
            </div>
            <ScrollArea className="h-52 rounded-lg border border-border min-[800px]:h-72">
              <ul className="flex flex-col gap-4 p-3">
                {resume.sections.map((section) => {
                  const roles = resume.roles.filter((role) => section.roleIds.includes(role.id));
                  return (
                    <li key={section.id} className="flex flex-col gap-1.5">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-xs font-medium tracking-wide text-primary uppercase">
                          {KIND_LABEL[section.kind]}
                        </span>
                        <span className="font-medium">{section.title}</span>
                      </div>
                      {roles.map((role) => (
                        <p key={role.id} className="text-sm text-foreground">
                          <span className="font-medium">{role.title}</span>
                          {role.orgPlain ? ` — ${role.orgPlain}` : ""}
                          {role.dates ? ` · ${role.dates}` : ""}
                          <span className="text-muted-foreground">
                            {" "}
                            · {role.bullets.length} bullet{role.bullets.length === 1 ? "" : "s"}
                          </span>
                        </p>
                      ))}
                      {roles.length === 0 && section.bullets.length > 0 ? (
                        <ul className="list-disc pl-4 text-sm text-muted-foreground">
                          {section.bullets.slice(0, 3).map((bullet) => (
                            <li key={bullet}>{snippet(bullet, 180)}</li>
                          ))}
                        </ul>
                      ) : null}
                      {roles.length === 0 && section.bullets.length === 0 && section.text ? (
                        <p className="text-sm text-muted-foreground">{snippet(section.text)}</p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
