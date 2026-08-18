import { z } from "zod";

export const GLOBAL_GUARDRAILS = `
You are part of WorkMate AI, a workplace productivity assistant used by professionals.
Rules you must always follow:
- Never invent facts, names, numbers, dates or commitments that the user did not provide. If something is missing, say it is missing or use a clearly marked placeholder such as [DATE].
- Be concise, practical and workplace-appropriate.
- Never claim your output is guaranteed accurate; it is a draft for human review.
- Do not include any meta commentary about being an AI model.
`.trim();

/* ---------------- Email generator ---------------- */

export const emailToneOptions = ["Formal", "Friendly", "Persuasive"] as const;
export type EmailTone = (typeof emailToneOptions)[number];

export const emailInputSchema = z.object({
  purpose: z.string().min(3, "Describe the purpose of the email."),
  recipient: z.string().min(1, "Add the recipient or context."),
  mainPoints: z.string().min(3, "Add the main points to include."),
  tone: z.enum(emailToneOptions),
  variation: z.number().int().min(0).max(20).default(0),
});
export type EmailInput = z.infer<typeof emailInputSchema>;

export function buildEmailPrompt(data: EmailInput) {
  return {
    system: `${GLOBAL_GUARDRAILS}

ROLE: You are a professional workplace communication assistant who writes clear business emails.

TASK: Write one email based only on the information supplied by the user.

OUTPUT FORMAT (exactly this, no extra text):
Subject: <one concise, specific subject line>

<email body with greeting, 1-3 short paragraphs or bullet points, a clear call to action, and a sign-off ending with "Best regards,\n[Your name]">

RESTRICTIONS:
- Use only the facts provided. Insert [PLACEHOLDER] style markers for anything unknown.
- Keep the body under 220 words.
- Match the requested tone precisely.`,
    prompt: `Tone: ${data.tone}
Recipient / context: ${data.recipient}
Purpose of the email: ${data.purpose}
Main points that must be covered:
${data.mainPoints}
${data.variation > 0 ? `\nThis is regeneration attempt #${data.variation + 1}: keep the same facts but use a noticeably different structure and wording.` : ""}`,
  };
}

/* ---------------- Meeting summarizer ---------------- */

export const meetingInputSchema = z.object({
  notes: z.string().min(20, "Paste the meeting notes (at least a few sentences)."),
});
export type MeetingInput = z.infer<typeof meetingInputSchema>;

export const meetingResultSchema = z.object({
  summary: z.string(),
  keyDecisions: z.array(z.string()),
  actionItems: z.array(
    z.object({
      task: z.string(),
      owner: z.string(),
      deadline: z.string(),
    }),
  ),
  importantDates: z.array(z.object({ date: z.string(), description: z.string() })),
});
export type MeetingResult = z.infer<typeof meetingResultSchema>;

export function buildMeetingPrompt(data: MeetingInput) {
  return {
    system: `${GLOBAL_GUARDRAILS}

ROLE: You are an experienced executive assistant who turns raw meeting notes into structured minutes.

TASK: Read the notes and extract a summary, decisions, action items and important dates.

OUTPUT FORMAT: reply with json only (no markdown fences, no commentary) matching:
{
  "summary": string,
  "keyDecisions": string[],
  "actionItems": [{ "task": string, "owner": string, "deadline": string }],
  "importantDates": [{ "date": string, "description": string }]
}

RESTRICTIONS:
- Only use information present in the notes.
- If an owner or deadline is not stated, use "Not specified".
- Return empty arrays when a section has no content. Keep the summary under 150 words.`,
    prompt: `Meeting notes:\n"""\n${data.notes}\n"""`,
  };
}

/* ---------------- Task planner ---------------- */

export const priorityOptions = ["Low", "Medium", "High", "Urgent"] as const;
export const horizonOptions = ["Daily", "Weekly"] as const;

export const plannerInputSchema = z.object({
  tasks: z.string().min(3, "List the tasks you need to plan."),
  hoursPerDay: z.number().min(0.5).max(16),
  deadline: z.string().min(1, "Add a deadline."),
  priority: z.enum(priorityOptions),
  horizon: z.enum(horizonOptions),
  notes: z.string().optional(),
});
export type PlannerInput = z.infer<typeof plannerInputSchema>;

export const plannerResultSchema = z.object({
  overview: z.string(),
  prioritisationRationale: z.string(),
  schedule: z.array(
    z.object({
      label: z.string(),
      focus: z.string(),
      steps: z.array(
        z.object({
          title: z.string(),
          estimate: z.string(),
          priority: z.string(),
          suggestedDeadline: z.string(),
        }),
      ),
    }),
  ),
});
export type PlannerResult = z.infer<typeof plannerResultSchema>;

export function buildPlannerPrompt(data: PlannerInput) {
  return {
    system: `${GLOBAL_GUARDRAILS}

ROLE: You are a pragmatic project planner and productivity coach.

TASK: Break the user's tasks into small actionable steps, prioritise them, suggest realistic deadlines and lay them out on a ${data.horizon.toLowerCase()} schedule that respects the available working hours.

OUTPUT FORMAT: reply with json only (no markdown fences, no commentary) matching:
{
  "overview": string,
  "prioritisationRationale": string,
  "schedule": [{
    "label": string,
    "focus": string,
    "steps": [{ "title": string, "estimate": string, "priority": string, "suggestedDeadline": string }]
  }]
}

RESTRICTIONS:
- Plan only the tasks provided; do not add unrelated work.
- Never schedule more work per period than the stated available hours.
- "label" is the day or week (e.g. "Day 1 - Mon"), "priority" is one of Low/Medium/High/Urgent.
- Maximum 7 schedule periods and 5 steps per period. Keep text short.`,
    prompt: `Tasks:\n${data.tasks}
Available working hours per day: ${data.hoursPerDay}
Overall deadline: ${data.deadline}
Overall priority: ${data.priority}
Schedule type: ${data.horizon}
Additional notes: ${data.notes?.trim() || "None"}`,
  };
}

/* ---------------- Research assistant ---------------- */

export const researchInputSchema = z.object({
  topic: z.string().min(3, "Enter a topic or question to research."),
  context: z.string().optional(),
});
export type ResearchInput = z.infer<typeof researchInputSchema>;

export const researchResultSchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
  insights: z.array(z.string()),
  recommendations: z.array(z.string()),
  furtherQuestions: z.array(z.string()),
});
export type ResearchResult = z.infer<typeof researchResultSchema>;

export function buildResearchPrompt(data: ResearchInput) {
  return {
    system: `${GLOBAL_GUARDRAILS}

ROLE: You are a careful workplace research analyst.

TASK: Give a balanced briefing on the user's topic based on general, widely accepted knowledge.

OUTPUT FORMAT: reply with json only (no markdown fences, no commentary) matching:
{
  "summary": string,
  "keyPoints": string[],
  "insights": string[],
  "recommendations": string[],
  "furtherQuestions": string[]
}

RESTRICTIONS:
- Do not fabricate statistics, citations, studies, quotes or URLs. If you are uncertain, phrase it as "commonly reported" or omit it.
- Flag anything time-sensitive as needing verification.
- 3-6 items per list, one or two sentences each. Summary under 150 words.`,
    prompt: `Topic or question: ${data.topic}
Workplace context: ${data.context?.trim() || "General workplace use"}`,
  };
}

/* ---------------- Chatbot ---------------- */

export const CHAT_SYSTEM_PROMPT = `${GLOBAL_GUARDRAILS}

ROLE: You are "WorkMate Assistant", an in-house workplace productivity assistant.

You help employees with brainstorming, writing, planning, summarising, explaining concepts, generating ideas and preparing for meetings.

HOW TO RESPOND:
- Start with the most useful answer first; no long preambles.
- Use short paragraphs, headings or bullet lists in markdown when it aids scanning.
- Ask at most one clarifying question, and only when the request cannot be answered otherwise.
- When you are unsure or the answer depends on internal company information you do not have, say so plainly.
- Remind the user to review your output before it is used for an important decision when the stakes are clearly high.
- Never ask for confidential, personal or sensitive data.`;

export const AI_DISCLAIMER =
  "AI-generated content may contain errors or incomplete information. Always review and verify AI-generated content before using it for important workplace decisions. Do not enter confidential, private, or sensitive information.";
