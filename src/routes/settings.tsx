import { createFileRoute } from "@tanstack/react-router";
import { Moon, ShieldCheck, Sun, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { AppShell } from "@/components/app-shell";
import { useWorkmate } from "@/components/workmate-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/use-theme";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — WorkMate AI" },
      {
        name: "description",
        content:
          "Manage your WorkMate AI appearance, activity history and review the responsible AI usage policy.",
      },
      { property: "og:title", content: "Settings — WorkMate AI" },
      {
        property: "og:description",
        content: "Appearance, activity history and responsible AI guidelines.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { activity, clearActivity } = useWorkmate();
  const { dark, setTheme } = useTheme();

  return (
    <AppShell title="Settings" description="Appearance, data and responsible AI guidelines">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>Choose the theme that suits your workspace.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <Label htmlFor="theme" className="flex items-center gap-2">
            {dark ? <Moon className="size-4" aria-hidden /> : <Sun className="size-4" aria-hidden />}
            Dark mode
          </Label>
          <Switch id="theme" checked={dark} onCheckedChange={setTheme} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity history</CardTitle>
          <CardDescription>
            Your recent activity is stored only in this browser — nothing is shared.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {activity.length} recorded {activity.length === 1 ? "item" : "items"}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              clearActivity();
              toast.success("Activity history cleared");
            }}
            disabled={activity.length === 0}
          >
            <Trash2 /> Clear history
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-4 text-primary" aria-hidden /> Responsible AI usage
          </CardTitle>
          <CardDescription>How WorkMate AI should be used at work.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <AiDisclaimer />
          <Separator />
          <ul className="list-disc space-y-2 pl-5">
            <li>Every output is a draft. A human must review it before it is shared or actioned.</li>
            <li>
              Never enter confidential, private, personal or commercially sensitive information.
            </li>
            <li>
              AI output is never guaranteed to be accurate — verify facts, figures and dates against
              reliable sources.
            </li>
            <li>The assistant only works from what you provide and should not invent details.</li>
            <li>
              AI keys and model calls run on the server; secret credentials are never exposed to the
              browser.
            </li>
          </ul>
        </CardContent>
      </Card>
    </AppShell>
  );
}
