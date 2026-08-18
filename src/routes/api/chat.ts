import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { WORKMATE_MODEL } from "@/lib/ai-core.server";
import { CHAT_SYSTEM_PROMPT } from "@/lib/ai-prompts";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: unknown };
        if (!Array.isArray(messages) || messages.length === 0) {
          return new Response("Please type a message first.", { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return new Response("AI is not configured for this workspace yet.", { status: 500 });
        }

        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway(WORKMATE_MODEL),
          system: CHAT_SYSTEM_PROMPT,
          messages: convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
