import { streamText } from "ai";
import type { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

export const WORKMATE_MODEL = "google/gemini-3.6-flash";

export class FriendlyAiError extends Error {}

function friendlyMessage(error: unknown) {
  const status = (error as { statusCode?: number; status?: number })?.statusCode ??
    (error as { status?: number })?.status;
  if (status === 429) {
    return "The AI assistant is handling a lot of requests right now. Please wait a moment and try again.";
  }
  if (status === 402) {
    return "The AI workspace has run out of credits. Please ask the workspace owner to top up before generating again.";
  }
  if (status === 403) {
    return "AI generation is currently disabled for this workspace. Please contact your administrator.";
  }
  if (status === 400) {
    return "That request was too large or could not be processed. Try shortening your input and generating again.";
  }
  return "The AI service is temporarily unavailable. Please try again in a moment.";
}

export async function runPromptText(system: string, prompt: string) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new FriendlyAiError("AI is not configured for this workspace yet.");

  try {
    const gateway = createLovableAiGatewayProvider(key);
    const result = streamText({ model: gateway(WORKMATE_MODEL), system, prompt });
    const text = await result.text;
    if (!text.trim()) {
      throw new FriendlyAiError("The AI returned an empty response. Please try again.");
    }
    return text.trim();
  } catch (error) {
    if (error instanceof FriendlyAiError) throw error;
    console.error("[workmate-ai]", error);
    throw new FriendlyAiError(friendlyMessage(error));
  }
}

function extractJson(raw: string) {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) text = fence[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new FriendlyAiError("Unreadable AI response.");
  return text.slice(start, end + 1);
}

export async function runPromptJson<T>(
  system: string,
  prompt: string,
  schema: z.ZodType<T>,
): Promise<T> {
  const raw = await runPromptText(system, prompt);
  try {
    return schema.parse(JSON.parse(extractJson(raw)));
  } catch (error) {
    console.error("[workmate-ai] parse failure", error, raw.slice(0, 500));
    throw new FriendlyAiError(
      "The AI response could not be formatted correctly. Please try generating again.",
    );
  }
}
