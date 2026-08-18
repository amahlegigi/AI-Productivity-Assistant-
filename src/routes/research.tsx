import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { HelpCircle, Lightbulb, ListChecks, Loader2, Search, Target, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AiDisclaimer, HumanReviewNote } from "@/components/ai-disclaimer";
import { AppShell } from "@/components/app-shell";
import { CopyButton } from "@/components/copy-button";
import { useWorkmate } from "@/components/workmate-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ResearchResult } from "@/lib/ai-prompts";
import { researchTopic } from "@/lib/ai.functions";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — WorkMate AI" },
      {
        name: "description",
        content:
          "Get a structured workplace briefing: topic summary, key points, insights, recommendations and questions for further research.",
      },
      { property: "og:title", content: "AI Research Assistant — WorkMate AI" },
      {
        property: "og:description",
        content: "Structured briefings you verify against reliable sources before using.",
      },
    ],
  }),
  component: ResearchPage,
});

function toPlainText(topic: string, r: ResearchResult) {
  return [
    `RESEARCH BRIEFING: ${topic}`,
    "",
    "SUMMARY",
    r.summary,
    "",
    "KEY POINTS",
    ...r.keyPoints.map((x) => `- ${x}`),
    "",
    "INSIGHTS",
    ...r.insights.map((x) => `- ${x}`),
    "",
    "RECOMMENDATIONS",
    ...r.recommendations.map((x) => `- ${x}`),
    "",
    "QUESTIONS FOR FURTHER RESEARCH",
    ...r.furtherQuestions.map((x) => `- ${x}`),
    "",
    "Verify this AI-generated briefing against reliable sources before using it.",
  ].join("\n");
}

const sections = [
  { key: "keyPoints", title: "Key points", icon: ListChecks },
  { key: "insights", title: "Important insights", icon: Lightbulb },
  { key: "recommendations", title: "Practical recommendations", icon: Target },
  { key: "furtherQuestions", title: "Questions for further research", icon: HelpCircle },
] as const;

function ResearchPage() {
  const run = useServerFn(researchTopic);
  const { logActivity } = useWorkmate();

  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResearchResult | null>(null);

  async function research() {
    if (topic.trim().length < 3) {
      setError("Enter a topic or question to research.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await run({
        data: { topic: topic.trim(), context: context.trim() || undefined },
      });
      setResult(data);
      logActivity({ kind: "research", title: topic.trim(), detail: "Research briefing generated" });
      toast.success("Briefing ready — remember to verify it");
    } catch (err) {
      const message =
        err instanceof Error && err.message && !err.message.includes("{")
          ? err.message
          : "We couldn't complete that research right now. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell
      title="AI Research Assistant"
      description="Structured briefings on any workplace topic — always verify before use"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="size-4 text-primary" aria-hidden /> What do you want to understand?
          </CardTitle>
          <CardDescription>
            The assistant avoids inventing statistics, studies or citations. Treat every point as a
            starting hypothesis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic or question</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="How can a small team adopt hybrid work successfully?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="context">Workplace context (optional)</Label>
            <Textarea
              id="context"
              rows={3}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="12-person support team, mostly junior, two office days per week"
            />
          </div>
          {error ? (
            <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button onClick={research} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : <Search />}
              {loading ? "Researching…" : "Research topic"}
            </Button>
            <Button
              variant="ghost"
              disabled={loading}
              onClick={() => {
                setTopic("");
                setContext("");
                setResult(null);
                setError(null);
              }}
            >
              <Trash2 /> Clear
            </Button>
          </div>
          <AiDisclaimer />
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="flex items-center gap-3 py-10 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden /> Putting your briefing together…
          </CardContent>
        </Card>
      ) : !result ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm font-medium">No briefing yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter a topic above to get a summary, key points, insights and open questions.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Topic summary</CardTitle>
              <CardDescription>{topic}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed">{result.summary}</p>
              <CopyButton value={toPlainText(topic, result)} label="Copy full briefing" />
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            {sections.map(({ key, title, icon: Icon }) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="size-4 text-primary" aria-hidden /> {title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result[key].length ? (
                    <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
                      {result[key].map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nothing generated for this section.</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-warning/40 bg-warning/5">
            <CardContent className="space-y-2 py-5">
              <p className="text-sm font-semibold">Verify before you rely on this</p>
              <p className="text-sm text-muted-foreground">
                This briefing is AI-generated and is not guaranteed to be accurate or current. Check
                every claim against reliable, authoritative sources — internal documentation,
                official publications or subject-matter experts — before using it in important work.
              </p>
              <HumanReviewNote />
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
