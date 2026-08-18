import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarClock, Loader2, NotebookPen, Trash2, Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AiDisclaimer, HumanReviewNote } from "@/components/ai-disclaimer";
import { AppShell } from "@/components/app-shell";
import { CopyButton } from "@/components/copy-button";
import { useWorkmate } from "@/components/workmate-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type { MeetingResult } from "@/lib/ai-prompts";
import { summarizeMeeting } from "@/lib/ai.functions";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — WorkMate AI" },
      {
        name: "description",
        content:
          "Turn raw meeting notes into a summary, key decisions, an action-item table with owners and deadlines, and important dates.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — WorkMate AI" },
      {
        property: "og:description",
        content: "Structured minutes from messy notes, ready for human review.",
      },
    ],
  }),
  component: MeetingsPage,
});

function toPlainText(result: MeetingResult) {
  const lines = [
    "MEETING SUMMARY",
    result.summary,
    "",
    "KEY DECISIONS",
    ...(result.keyDecisions.length ? result.keyDecisions.map((d) => `- ${d}`) : ["- None recorded"]),
    "",
    "ACTION ITEMS",
    ...(result.actionItems.length
      ? result.actionItems.map((a) => `- ${a.task} | ${a.owner} | ${a.deadline}`)
      : ["- None recorded"]),
    "",
    "IMPORTANT DATES",
    ...(result.importantDates.length
      ? result.importantDates.map((d) => `- ${d.date}: ${d.description}`)
      : ["- None recorded"]),
  ];
  return lines.join("\n");
}

function MeetingsPage() {
  const run = useServerFn(summarizeMeeting);
  const navigate = useNavigate();
  const { logActivity, setPlannerSeed } = useWorkmate();

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MeetingResult | null>(null);

  async function summarize() {
    if (notes.trim().length < 20) {
      setError("Please paste your meeting notes first (at least a couple of sentences).");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await run({ data: { notes: notes.trim() } });
      setResult(data);
      logActivity({
        kind: "meeting",
        title: "Meeting summarised",
        detail: `${data.actionItems.length} action items · ${data.keyDecisions.length} decisions`,
      });
      toast.success("Meeting notes summarised");
    } catch (err) {
      const message =
        err instanceof Error && err.message && !err.message.includes("{")
          ? err.message
          : "We couldn't summarise those notes right now. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function sendToPlanner() {
    if (!result?.actionItems.length) return;
    setPlannerSeed({
      tasks: result.actionItems
        .map((a) => `${a.task} (owner: ${a.owner}, deadline: ${a.deadline})`)
        .join("\n"),
      notes: `From meeting summary: ${result.summary}`,
    });
    toast.success("Action items sent to the Task Planner");
    void navigate({ to: "/planner" });
  }

  return (
    <AppShell
      title="Meeting Notes Summarizer"
      description="Structured minutes, decisions and action items from raw notes"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <NotebookPen className="size-4 text-primary" aria-hidden /> Paste your meeting notes
          </CardTitle>
          <CardDescription>
            Anything the notes don't say will be marked as “Not specified” rather than guessed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Meeting notes</Label>
            <Textarea
              id="notes"
              rows={10}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste the raw notes or transcript from your meeting…"
            />
          </div>
          {error ? (
            <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button onClick={summarize} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : <Wand2 />}
              {loading ? "Summarising…" : "Summarise notes"}
            </Button>
            <Button
              variant="ghost"
              disabled={loading}
              onClick={() => {
                setNotes("");
                setResult(null);
                setError(null);
              }}
            >
              <Trash2 /> Clear
            </Button>
          </div>
          <AiDisclaimer compact />
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="flex items-center gap-3 py-10 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden /> Reading the notes and extracting
            decisions…
          </CardContent>
        </Card>
      ) : !result ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm font-medium">No summary yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Paste notes above to get a summary, decisions, action items and key dates.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <CopyButton value={toPlainText(result)} label="Copy full summary" size="default" />
            <Button
              variant="outline"
              onClick={sendToPlanner}
              disabled={result.actionItems.length === 0}
            >
              <CalendarClock /> Send action items to Task Planner
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Meeting summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed">{result.summary}</p>
              <CopyButton value={result.summary} label="Copy summary" />
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Key decisions</CardTitle>
              </CardHeader>
              <CardContent>
                {result.keyDecisions.length ? (
                  <ul className="list-disc space-y-2 pl-5 text-sm">
                    {result.keyDecisions.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No decisions were recorded.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Important dates</CardTitle>
              </CardHeader>
              <CardContent>
                {result.importantDates.length ? (
                  <ul className="space-y-2 text-sm">
                    {result.importantDates.map((d, i) => (
                      <li key={i} className="flex gap-3">
                        <Badge variant="secondary" className="shrink-0">
                          {d.date}
                        </Badge>
                        <span>{d.description}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No dates were mentioned.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Action items</CardTitle>
              <CardDescription>Confirm owners and deadlines with your team.</CardDescription>
            </CardHeader>
            <CardContent>
              {result.actionItems.length ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Responsible person</TableHead>
                        <TableHead>Deadline</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.actionItems.map((a, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{a.task}</TableCell>
                          <TableCell>{a.owner}</TableCell>
                          <TableCell>{a.deadline}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No action items were identified.</p>
              )}
              <HumanReviewNote className="mt-4" />
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
