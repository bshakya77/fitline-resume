"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  url: string;
  text: string;
  loading: boolean;
  error: string | null;
  onUrl: (value: string) => void;
  onText: (value: string) => void;
  onFetch: () => void;
};

export function JobPanel({ url, text, loading, error, onUrl, onText, onFetch }: Props) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Job</CardTitle>
        <CardDescription>Paste a posting or a link.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="job-url">Job link</Label>
          <div className="flex flex-col gap-2 min-[800px]:flex-row">
            <Input
              id="job-url"
              type="url"
              inputMode="url"
              placeholder="https://boards.example.com/jobs/ai-engineer"
              value={url}
              onChange={(event) => onUrl(event.target.value)}
              className="min-h-11"
            />
            <Button
              type="button"
              variant="secondary"
              className="min-h-11 w-full px-4 min-[800px]:w-auto"
              disabled={loading || !url.trim()}
              onClick={onFetch}
            >
              {loading ? "Fetching…" : "Fetch posting"}
            </Button>
          </div>
        </div>
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>The link did not come through</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <div className="flex flex-col gap-2">
          <Label htmlFor="job-text">Job description</Label>
          <Textarea
            id="job-text"
            value={text}
            onChange={(event) => onText(event.target.value)}
            placeholder="Paste the responsibilities, requirements, and tools from the posting."
            className="min-h-40 min-[800px]:min-h-52"
          />
          {text.trim() ? (
            <p className="text-sm text-muted-foreground">{text.trim().split(/\s+/).length} words</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
