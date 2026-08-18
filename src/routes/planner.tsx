import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarClock, Loader2, Mail, Trash2, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AiDisclaimer, HumanReviewNote } from "@/components/ai-disclaimer";
import { AppShell } from "@/components/app-shell";
import { CopyButton } from "@/components/copy-button";
import { useWorkmate } from "@/components/workmate-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { horizonOptions, priorityOptions, type PlannerResult } from "@/lib/ai-prompts";
import { planTasks } from "@/lib/ai.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — WorkMate AI" },
      {
        name: "description",
        content:
          "Break large tasks into actionable steps, prioritise them and build a realistic daily or weekly schedule with AI.",
      },
      { property: "og:title", content: "AI Task Planner — WorkMate AI" },
      {
        property: "og:description",
        content: "Prioritised steps, realistic deadlines and a schedule you can tick off.",
      },
    ],
  }),
  component: PlannerPage,
});

function priorityTone(priority: string) {
  const value = priority.toLowerCase();
  if (value.includes("urgent")) return "bg-destructive/10 text-destructive";
  if (value.includes("high")) return "bg-warning/20 text-warning-foreground";
  if (value.includes("low")) return "bg-muted text-muted-foreground";
  return "bg-primary/10 text-primary";
}

function toPlainText(result: PlannerResult) {
  return [
    "PLAN OVERVIEW",
    result.overview,
    "",
    "WHY THIS ORDER",
    result.prioritisationRationale,
    "",
    ...result.schedule.flatMap((period) => [
      `${period.label} — ${period.focus}`,
      ...period.steps.map(
        (s) => `  - ${s.title} (${s.estimate}, ${s.priority}, due ${s.suggestedDeadline})`,
      ),
      "",
    ]),
  ].join("\n");
}

function PlannerPage() {
  const run = useServerFn(planTasks);
  const { logActivity, plannerSeed, setPlannerSeed, setEmailSeed } = useWorkmate();

  const [tasks, setTasks] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState("6");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<(typeof priorityOptions)[number]>("Medium");
  const [horizon, setHorizon] = useState<(typeof horizonOptions)[number]>("Daily");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PlannerResult | null>(null);
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!plannerSeed) return;
    setTasks(plannerSeed.tasks);
    if (plannerSeed.notes) setNotes(plannerSeed.notes);
    setPlannerSeed(null);
    toast.success("Action items loaded from your meeting summary");
  }, [plannerSeed, setPlannerSeed]);

  async function plan() {
    const hours = Number(hoursPerDay);
    if (!tasks.trim() || !deadline.trim() || !Number.isFinite(hours) || hours <= 0) {
      setError("Add your tasks, available working hours and a deadline before planning.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await run({
        data: {
          tasks: tasks.trim(),
          hoursPerDay: Math.min(16, Math.max(0.5, hours)),
          deadline: deadline.trim(),
          priority,
          horizon,
          notes: notes.trim() || undefined,
        },
      });
      setResult(data);
      setDone({});
      logActivity({
        kind: "planner",
        title: `${horizon} plan created`,
        detail: `${data.schedule.length} periods · deadline ${deadline}`,
      });
      toast.success("Your plan is ready");
    } catch (err) {
      const message =
        err instanceof Error && err.message && !err.message.includes("{")
          ? err.message
          : "We couldn't build a plan right now. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const allSteps = result?.schedule.flatMap((p, pi) => p.steps.map((_, si) => `${pi}-${si}`)) ?? [];
  const completed = allSteps.filter((id) => done[id]).length;
  const progress = allSteps.length ? Math.round((completed / allSteps.length) * 100) : 0;

  return (
    <AppShell title="AI Task Planner" description="Turn a task list into a prioritised, realistic schedule">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClock className="size-4 text-primary" aria-hidden /> Planning inputs
            </CardTitle>
            <CardDescription>Only the tasks you list will be scheduled.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tasks">Tasks</Label>
              <Textarea
                id="tasks"
                rows={6}
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
                placeholder={"- Finish Q3 report\n- Prepare client demo\n- Onboard new intern"}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hours">Working hours per day</Label>
                <Input
                  id="hours"
                  type="number"
                  min={0.5}
                  max={16}
                  step={0.5}
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={priority}
                  onValueChange={(v) => setPriority(v as (typeof priorityOptions)[number])}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="horizon">Schedule</Label>
                <Select
                  value={horizon}
                  onValueChange={(v) => setHorizon(v as (typeof horizonOptions)[number])}
                >
                  <SelectTrigger id="horizon">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {horizonOptions.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="plannotes">Notes (optional)</Label>
              <Textarea
                id="plannotes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Meetings on Tuesday morning, prefer deep work early…"
              />
            </div>

            {error ? (
              <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button onClick={plan} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : <Wand2 />}
                {loading ? "Planning…" : "Create plan"}
              </Button>
              <Button
                variant="ghost"
                disabled={loading}
                onClick={() => {
                  setTasks("");
                  setNotes("");
                  setDeadline("");
                  setResult(null);
                  setError(null);
                  setDone({});
                }}
              >
                <Trash2 /> Clear
              </Button>
            </div>
            <AiDisclaimer compact />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          {loading ? (
            <Card>
              <CardContent className="flex items-center gap-3 py-10 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden /> Breaking your tasks into
                steps…
              </CardContent>
            </Card>
          ) : !result ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-sm font-medium">No plan yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add your tasks on the left, or send action items here from the Meeting Notes
                  Summarizer.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Plan overview</CardTitle>
                  <CardDescription>{result.overview}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {completed} of {allSteps.length} steps completed
                      </span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    <p className="font-medium">Why tasks were prioritised this way</p>
                    <p className="mt-1 text-muted-foreground">{result.prioritisationRationale}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <CopyButton value={toPlainText(result)} label="Copy plan" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEmailSeed({
                          purpose: "Share my work plan with my team",
                          recipient: "My team",
                          mainPoints: toPlainText(result),
                        });
                        toast.success("Plan sent to the Email Generator");
                      }}
                    >
                      <Mail /> Share via Email Generator
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <ol className="relative flex flex-col gap-4 border-l border-border pl-5">
                {result.schedule.map((period, pi) => (
                  <li key={pi} className="relative">
                    <span className="absolute -left-[27px] top-4 size-3 rounded-full border-2 border-background bg-primary" />
                    <Card>
                      <CardHeader className="gap-1 pb-3">
                        <CardTitle className="text-base">{period.label}</CardTitle>
                        <CardDescription>{period.focus}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {period.steps.map((step, si) => {
                          const id = `${pi}-${si}`;
                          const checked = !!done[id];
                          return (
                            <div
                              key={id}
                              className={cn(
                                "flex items-start gap-3 rounded-lg border border-border p-3 transition-colors",
                                checked && "bg-success/5",
                              )}
                            >
                              <Checkbox
                                id={id}
                                checked={checked}
                                onCheckedChange={(v) =>
                                  setDone((prev) => ({ ...prev, [id]: v === true }))
                                }
                                aria-label={`Mark "${step.title}" as complete`}
                                className="mt-0.5"
                              />
                              <div className="min-w-0 flex-1">
                                <label
                                  htmlFor={id}
                                  className={cn(
                                    "block text-sm font-medium",
                                    checked && "text-muted-foreground line-through",
                                  )}
                                >
                                  {step.title}
                                </label>
                                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                  <Badge
                                    variant="secondary"
                                    className={cn("font-medium", priorityTone(step.priority))}
                                  >
                                    {step.priority}
                                  </Badge>
                                  <span>{step.estimate}</span>
                                  <span aria-hidden>·</span>
                                  <span>Due {step.suggestedDeadline}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ol>
              <HumanReviewNote />
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
