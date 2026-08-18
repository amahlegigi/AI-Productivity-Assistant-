import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import { RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { CopyButton } from "@/components/copy-button";
import { WorkmateLogo } from "@/components/workmate-logo";
import { useWorkmate } from "@/components/workmate-store";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "WorkMate Assistant — AI Workplace Chatbot" },
      {
        name: "description",
        content:
          "Chat with WorkMate Assistant to brainstorm, write, plan, summarise, explain concepts and prepare for meetings.",
      },
      { property: "og:title", content: "WorkMate Assistant — AI Workplace Chatbot" },
      {
        property: "og:description",
        content: "An AI colleague for brainstorming, writing, planning and meeting prep.",
      },
    ],
  }),
  component: ChatPage,
});

const suggestions = [
  "Help me brainstorm 5 ideas to improve our onboarding process",
  "Draft an agenda for a 30-minute project kickoff meeting",
  "Explain OKRs to a new team member in simple terms",
  "Summarise this update into three bullet points for leadership",
];

function textOf(parts: { type: string; text?: string }[]) {
  return parts
    .filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join("");
}

function ChatPage() {
  const { logActivity } = useWorkmate();
  const [input, setInput] = useState("");
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);

  const { messages, sendMessage, status, setMessages } = useChat({
    transport,
    onError: () =>
      toast.error("WorkMate Assistant couldn't respond right now. Please try again in a moment."),
  });

  const busy = status === "submitted" || status === "streaming";

  function send(text: string) {
    const value = text.trim();
    if (!value) {
      toast.error("Type a message before sending.");
      return;
    }
    if (busy) return;
    void sendMessage({ text: value });
    setInput("");
    logActivity({ kind: "chat", title: "Chatted with WorkMate Assistant", detail: value.slice(0, 80) });
  }

  return (
    <AppShell
      title="WorkMate Assistant"
      description="Brainstorm, write, plan and prepare — in conversation"
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setMessages([]);
            toast.success("Conversation cleared");
          }}
          disabled={messages.length === 0}
        >
          <RotateCcw /> Clear
        </Button>
      }
    >
      <Card className="flex h-[calc(100vh-16rem)] min-h-[520px] flex-col overflow-hidden">
        <CardContent className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:p-4">
          <Conversation className="min-h-0 flex-1">
            <ConversationContent className="gap-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-10 text-center">
                  <WorkmateLogo className="size-12 text-primary" />
                  <div>
                    <p className="font-display text-lg font-semibold">
                      Hi, I'm WorkMate Assistant
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Ask me to brainstorm, write, plan, summarise or explain something.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestions.map((s) => (
                      <Button key={s} variant="outline" size="sm" onClick={() => send(s)}>
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message) => {
                  const text = textOf(message.parts as { type: string; text?: string }[]);
                  return (
                    <Message from={message.role} key={message.id}>
                      <MessageContent>
                        <MessageResponse>{text}</MessageResponse>
                        {message.role === "assistant" && text ? (
                          <div className="mt-2">
                            <CopyButton value={text} label="Copy" variant="ghost" />
                          </div>
                        ) : null}
                      </MessageContent>
                    </Message>
                  );
                })
              )}
              {status === "submitted" ? (
                <Shimmer className="text-sm">Thinking…</Shimmer>
              ) : null}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <PromptInput
            onSubmit={(_message, event) => {
              event.preventDefault();
              send(input);
            }}
          >
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask WorkMate Assistant anything about your work…"
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} disabled={!input.trim() && !busy} />
            </PromptInputFooter>
          </PromptInput>
        </CardContent>
      </Card>
    </AppShell>
  );
}
