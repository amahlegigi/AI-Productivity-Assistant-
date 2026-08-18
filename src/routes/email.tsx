import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Mail, RefreshCw, Trash2, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AiDisclaimer, HumanReviewNote } from "@/components/ai-disclaimer";
import { AppShell } from "@/components/app-shell";
import { CopyButton } from "@/components/copy-button";
import { useWorkmate } from "@/components/workmate-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { emailToneOptions, type EmailTone } from "@/lib/ai-prompts";
import { generateEmail } from "@/lib/ai.functions";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — WorkMate AI" },
      {
        name: "description",
        content:
          "Generate professional workplace emails with a clear subject line and body in a formal, friendly or persuasive tone.",
      },
      { property: "og:title", content: "Smart Email Generator — WorkMate AI" },
      {
        property: "og:description",
        content: "Turn a few bullet points into a polished, review-ready business email.",
      },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const run = useServerFn(generateEmail);
  const { logActivity, emailSeed, setEmailSeed } = useWorkmate();

  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [mainPoints, setMainPoints] = useState("");
  const [tone, setTone] = useState<EmailTone>("Formal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ subject: string; body: string } | null>(null);
  const [variation, setVariation] = useState(0);

  useEffect(() => {
    if (!emailSeed) return;
    if (emailSeed.purpose) setPurpose(emailSeed.purpose);
    if (emailSeed.recipient) setRecipient(emailSeed.recipient);
    if (emailSeed.mainPoints) setMainPoints(emailSeed.mainPoints);
    setEmailSeed(null);
    toast.success("Content loaded into the email generator");
  }, [emailSeed, setEmailSeed]);

  async function generate(nextVariation: number) {
    if (!purpose.trim() || !recipient.trim() || !mainPoints.trim()) {
      setError("Please fill in the purpose, recipient and main points before generating.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await run({
        data: {
          purpose: purpose.trim(),
          recipient: recipient.trim(),
          mainPoints: mainPoints.trim(),
          tone,
          variation: nextVariation,
        },
      });
      setResult(data);
      setVariation(nextVariation);
      logActivity({ kind: "email", title: data.subject, detail: `${tone} email · ${recipient}` });
      toast.success("Email draft ready for your review");
    } catch (err) {
      const message =
        err instanceof Error && err.message && !err.message.includes("{")
          ? err.message
          : "We couldn't generate the email right now. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    setPurpose("");
    setRecipient("");
    setMainPoints("");
    setTone("Formal");
    setResult(null);
    setError(null);
    setVariation(0);
  }

  const fullEmail = result ? `Subject: ${result.subject}\n\n${result.body}` : "";

  return (
    <AppShell
      title="Smart Email Generator"
      description="Draft clear, professional emails from a few key points"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="size-4 text-primary" aria-hidden /> Email brief
            </CardTitle>
            <CardDescription>
              The assistant only uses what you provide — it will never invent facts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purpose">Email purpose</Label>
              <Input
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Request an extension on the Q3 report"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient / context</Label>
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="My line manager, who is already aware of the delay"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="points">Main points</Label>
              <Textarea
                id="points"
                rows={6}
                value={mainPoints}
                onChange={(e) => setMainPoints(e.target.value)}
                placeholder={"- Data from finance arrived 4 days late\n- Draft ready by Friday\n- Ask for a 3-day extension"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as EmailTone)}>
                <SelectTrigger id="tone">
                  <SelectValue placeholder="Select a tone" />
                </SelectTrigger>
                <SelectContent>
                  {emailToneOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error ? (
              <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => generate(0)} disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : <Wand2 />}
                {loading ? "Generating…" : "Generate"}
              </Button>
              <Button
                variant="outline"
                onClick={() => generate(variation + 1)}
                disabled={loading || !result}
              >
                <RefreshCw /> Regenerate
              </Button>
              <CopyButton value={fullEmail} label="Copy" size="default" />
              <Button variant="ghost" onClick={clearAll} disabled={loading}>
                <Trash2 /> Clear
              </Button>
            </div>
            <AiDisclaimer compact />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generated email</CardTitle>
            <CardDescription>Editable draft — review before sending.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center gap-3 rounded-lg border border-dashed border-border p-8 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Writing your email…
              </div>
            ) : !result ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <p className="text-sm font-medium">No draft yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Fill in the brief and select Generate to create an email.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject line</Label>
                  <Input
                    id="subject"
                    value={result.subject}
                    onChange={(e) => setResult({ ...result, subject: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body">Email body</Label>
                  <Textarea
                    id="body"
                    rows={16}
                    value={result.body}
                    onChange={(e) => setResult({ ...result, body: e.target.value })}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <CopyButton value={result.subject} label="Copy subject" />
                  <CopyButton value={result.body} label="Copy body" />
                </div>
                <HumanReviewNote />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
