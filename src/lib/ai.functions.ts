import { createServerFn } from "@tanstack/react-start";
import { FriendlyAiError, runPromptJson, runPromptText } from "./ai-core.server";
import {
  buildEmailPrompt,
  buildMeetingPrompt,
  buildPlannerPrompt,
  buildResearchPrompt,
  emailInputSchema,
  meetingInputSchema,
  meetingResultSchema,
  plannerInputSchema,
  plannerResultSchema,
  researchInputSchema,
  researchResultSchema,
} from "./ai-prompts";

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => emailInputSchema.parse(input))
  .handler(async ({ data }) => {
    const { system, prompt } = buildEmailPrompt(data);
    const text = await runPromptText(system, prompt);
    const match = text.match(/^\s*subject:\s*(.+)$/im);
    const subject = match?.[1]?.trim() ?? "Draft email";
    const body = match ? text.slice(text.indexOf(match[0]) + match[0].length).trim() : text;
    if (!body) throw new FriendlyAiError("The AI returned an empty email. Please try again.");
    return { subject, body };
  });

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => meetingInputSchema.parse(input))
  .handler(async ({ data }) => {
    const { system, prompt } = buildMeetingPrompt(data);
    return runPromptJson(system, prompt, meetingResultSchema);
  });

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => plannerInputSchema.parse(input))
  .handler(async ({ data }) => {
    const { system, prompt } = buildPlannerPrompt(data);
    return runPromptJson(system, prompt, plannerResultSchema);
  });

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => researchInputSchema.parse(input))
  .handler(async ({ data }) => {
    const { system, prompt } = buildResearchPrompt(data);
    return runPromptJson(system, prompt, researchResultSchema);
  });
