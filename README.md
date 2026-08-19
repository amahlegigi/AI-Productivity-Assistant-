# WorkMate AI Assistant

Build WorkMate AI – AI-Powered Workplace Productivity Platform

Build a complete, modern, responsive web application called WorkMate AI.

1. Purpose

WorkMate AI is a single AI-powered workplace productivity platform that helps employees automate common workplace tasks using generative AI.

The platform should have a professional business/technology design and work well on both desktop and mobile devices.

The application must feel like one integrated platform, not several separate applications.

2. Main Dashboard

Create a dashboard with:

WorkMate AI logo/name

Welcome message

Short description: "Your intelligent workplace productivity assistant"

Sidebar navigation

Dashboard overview

Cards for each AI feature

Recent activity section

Responsive mobile navigation

Sidebar options:

Dashboard

Smart Email Generator

Meeting Notes Summarizer

AI Task Planner

AI Research Assistant

AI Workplace Chatbot

Settings

3. Smart Email Generator

Create an AI email-generation feature.

Inputs:

Email purpose

Recipient/context

Main points

Tone selector

Tone options:

Formal

Friendly

Persuasive

The AI should generate:

Professional subject line

Complete email body

Include buttons:

Generate

Regenerate

Copy

Clear

The AI must not invent information that the user did not provide.

Use a structured prompt that instructs the AI to act as a professional workplace communication assistant.

4. Meeting Notes Summarizer

Create a feature where users can paste long meeting notes.

The AI should produce:

Meeting Summary

A concise summary of the discussion.

Key Decisions

Important decisions made during the meeting.

Action Items

Display action items in a table containing:

Task

Responsible person

Deadline

Important Dates

Make the output easy to read and allow the user to copy the results.

5. AI Task Planner

Create an AI-powered task planning feature.

Users should be able to enter:

Tasks

Available working hours

Deadline

Priority

Optional notes

The AI should:

Break large tasks into smaller actionable steps

Prioritize tasks

Suggest realistic deadlines

Create a daily or weekly schedule

Explain why tasks were prioritized

Display the generated schedule in a clean timeline or task-card layout.

Allow users to mark tasks as completed.

6. AI Research Assistant

Create an AI research assistant where users can enter a topic or question.

The AI should provide:

Topic summary

Key points

Important insights

Practical recommendations

Questions for further research

Clearly state that AI-generated research should be verified using reliable sources before being used in important work.

Do not present unverified information as guaranteed fact.

7. AI Workplace Chatbot

Create an interactive chatbot called WorkMate Assistant.

The chatbot should help users with workplace tasks such as:

Brainstorming

Writing

Planning

Summarizing

Explaining concepts

Creating ideas

Preparing for meetings

The interface should look like a modern AI chat application.

Include:

User messages

AI responses

Loading state

Clear conversation button

Input box

Send button

8. Integrated AI Workflow

Make the features work together where possible.

For example:

Meeting Notes
→ AI extracts action items
→ User sends action items to Task Planner
→ Task Planner creates a schedule

Also allow generated email content to be copied into the Email Generator for further refinement.

The goal is for WorkMate AI to feel like one connected workplace assistant.

9. Prompt Engineering

Use carefully structured prompts for every AI feature.

Prompts should include:

AI role/persona

Clear task

Relevant user context

Desired output format

Restrictions against inventing information

Instructions to produce concise, useful workplace responses

Do not simply send raw user input to the AI.

10. Responsible AI

Add a clearly visible responsible AI disclaimer throughout the application.

Use wording similar to:

"AI-generated content may contain errors or incomplete information. Always review and verify AI-generated content before using it for important workplace decisions. Do not enter confidential, private, or sensitive information."

Include human review as part of the workflow.

The application should never claim that AI-generated information is guaranteed to be accurate.

11. UI/UX Design

Create a clean, modern and professional interface suitable for a workplace.

Design requirements:

Modern dashboard

Professional typography

Consistent spacing

Clear buttons

Cards for features

Accessible forms

Loading indicators

Error messages

Empty states

Success notifications

Responsive design

Desktop and mobile layouts

Use a professional technology/business aesthetic.

Avoid making the interface unnecessarily complicated.

12. Technical Requirements

Build the application as a functional web application rather than a static mockup.

Use a suitable modern frontend stack.

Organize the code into reusable components.

Make sure navigation works between all sections.

Use secure handling of API keys and do not expose secret keys in frontend code.

If an AI API is required, structure the application so the API can be connected securely.

13. Error Handling

Add user-friendly error messages when:

AI generation fails

The user submits empty input

The AI service is unavailable

A request takes too long

Never show technical errors directly to normal users.

14. Final Goal

The finished application should demonstrate:

Practical AI implementation

Strong prompt engineering

Workplace problem solving

Responsible AI usage

Human oversight

Modern UI/UX

Responsive design

Multiple AI-powered features within ONE integrated platform

Before finishing, test every feature and make sure the application is functional, visually consistent and easy to demonstrate in a project presentation.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/61c68d49-0fea-48c1-9054-749a4d91b88b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
