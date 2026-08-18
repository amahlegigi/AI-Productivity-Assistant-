import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  CalendarClock,
  Mail,
  NotebookPen,
  Search,
  Workflow,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { useWorkmate } from "@/components/workmate-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WorkMate AI — Workplace Productivity Dashboard" },
      {
        name: "description",
        content:
          "WorkMate AI is an integrated workplace assistant: draft emails, summarise meetings, plan tasks, research topics and chat with AI in one platform.",
      },
      { property: "og:title", content: "WorkMate AI — Workplace Productivity Dashboard" },
      {
        property: "og:description",
        content:
          "One AI platform for emails, meeting notes, task planning, research and workplace chat.",
      },
    ],
  }),
  component: Dashboard,
});

const features = [
  {
    to: "/email",
    label: "Smart Email Generator",
    icon: Mail,
    kind: "email" as const,
    blurb: "Turn a few bullet points into a polished subject line and email body in any tone.",
  },
  {
    to: "/meetings",
    label: "Meeting Notes Summarizer",
    icon: NotebookPen,
    kind: "meeting" as const,
    blurb: "Paste raw notes and get a summary, decisions, an action-item table and key dates.",
  },
  {
    to: "/planner",
    label: "AI Task Planner",
    icon: CalendarClock,
    kind: "planner" as const,
    blurb: "Break big tasks into steps, prioritise them and build a realistic daily or weekly plan.",
  },
  {
    to: "/research",
    label: "AI Research Assistant",
    icon: Search,
    kind: "research" as const,
    blurb: "Get a structured briefing with key points, insights and questions to investigate.",
  },
  {
    to: "/chat",
    label: "AI Workplace Chatbot",
    icon: Bot,
    kind: "chat" as const,
    blurb: "Brainstorm, write, plan and prepare for meetings with WorkMate Assistant.",
  },
];

const kindLabels: Record<string, string> = {
  email: "Email",
  meeting: "Meeting",
  planner: "Planner",
  research: "Research",
  chat: "Chat",
};

function Dashboard() {
  const { activity, usage, hydrated } = useWorkmate();

  return (
    <AppShell
      title="Welcome back 👋"
      description="Your intelligent workplace productivity assistant"
      actions={
        <Button asChild className="hidden sm:inline-flex">
          <Link to="/chat">
            Ask WorkMate <ArrowRight />
          </Link>
        </Button>
      }
    >
      <Card className="surface-gradient overflow-hidden border-primary/20">
        <CardHeader>
          <Badge variant="secondary" className="w-fit">
            One connected platform
          </Badge>
          <CardTitle className="text-2xl sm:text-3xl">
            <span className="brand-gradient-text">WorkMate AI</span>
          </CardTitle>
          <CardDescription className="max-w-2xl text-sm sm:text-base">
            Your intelligent workplace productivity assistant. Draft communication, capture
            decisions, plan the week and research topics — with a human review step built into every
            workflow.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link to="/email">Draft an email</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/meetings">Summarise meeting notes</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/planner">Plan my week</Link>
          </Button>
        </CardContent>
      </Card>

      <section aria-labelledby="features-heading" className="flex flex-col gap-3">
        <h2 id="features-heading" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          AI features
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {features.map(({ to, label, icon: Icon, blurb, kind }) => (
            <Card key={to} className="group flex flex-col shadow-[var(--shadow-card)]">
              <CardHeader className="gap-2">
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  {hydrated && usage[kind] > 0 ? (
                    <Badge variant="secondary">{usage[kind]} used</Badge>
                  ) : null}
                </div>
                <CardTitle className="text-base">{label}</CardTitle>
                <CardDescription>{blurb}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button asChild variant="ghost" size="sm" className="px-0 text-primary">
                  <Link to={to}>
                    Open <ArrowRight />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
            <CardDescription>The last things you generated in WorkMate AI.</CardDescription>
          </CardHeader>
          <CardContent>
            {!hydrated ? (
              <p className="text-sm text-muted-foreground">Loading your activity…</p>
            ) : activity.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center">
                <p className="text-sm font-medium">No activity yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Generate an email or summarise a meeting and it will appear here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {activity.slice(0, 8).map((item) => (
                  <li key={item.id} className="flex items-start gap-3 py-3">
                    <Badge variant="outline" className="mt-0.5 shrink-0">
                      {kindLabels[item.kind]}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                    <time className="shrink-0 text-xs text-muted-foreground">
                      {new Date(item.at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Workflow className="size-4 text-primary" aria-hidden /> Connected workflow
            </CardTitle>
            <CardDescription>Features hand work over to each other.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              1. Summarise meeting notes → 2. Send the extracted action items to the Task Planner →
              3. Get a scheduled, prioritised plan.
            </p>
            <p>Any generated text can also be copied straight into the Email Generator.</p>
            <AiDisclaimer compact />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
