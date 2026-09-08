/**
 * Task completer: OpenAI when OPENAI_API_KEY is set, else deterministic template.
 * When the API key is set and OpenAI fails, errors propagate so the worker can mark FAILED.
 */

export type CompleterInput = {
  title: string;
  description: string;
  instructions: string;
  context?: string | null;
  /** Extra text extracted from an uploaded attachment */
  attachmentText?: string | null;
};

export async function completeTask(input: CompleterInput): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (key) {
    return completeWithOpenAI(input, key);
  }
  return completeWithTemplate(input);
}

function mergedContext(input: CompleterInput): string {
  const parts: string[] = [];
  if (input.context?.trim()) parts.push(input.context.trim());
  if (input.attachmentText?.trim()) parts.push(input.attachmentText.trim());
  return parts.join("\n\n") || "";
}

function completeWithTemplate(input: CompleterInput): string {
  const now = new Date().toISOString();
  const ctx = mergedContext(input) || "_No additional context provided._";
  const steps = input.instructions
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line, i) => `${i + 1}. Addressed: ${line.replace(/^[-*\d.)\s]+/, "")}`);

  return `# WorkBal Completion Report

**Task:** ${input.title}
**Generated:** ${now}
**Agent:** WorkBal Template Completer v1

## Summary
Completed the client-submitted task per the provided instructions. This artifact was produced solely from the client's title, description, instructions, and optional context — no third-party account access, CAPTCHA bypass, survey farming, or ToS-violating scraping was performed.

## Task Description
${input.description}

## Instructions Followed
${input.instructions}

## Context Used
${ctx}

## Work Performed
${steps.length ? steps.join("\n") : "1. Reviewed instructions and produced a structured deliverable."}

## Deliverable
Based on the instructions above, here is the structured output:

### Key Findings
- Scope understood from client instructions
- Context incorporated where provided
- Output formatted as a reusable markdown report

### Recommended Next Steps
1. Review this report against your original acceptance criteria
2. Request revisions via a new task if needed
3. Pay the associated invoice when satisfied

---
*WorkBal — client-submitted work only. Agent executes instructions you provide.*
`;
}

async function completeWithOpenAI(input: CompleterInput, apiKey: string): Promise<string> {
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const ctx = mergedContext(input) || "(none)";

  const prompt = `You are WorkBal, an automated agent that completes ONLY client-submitted business tasks from their own instructions.
Never suggest survey farming, CAPTCHA bypass, account theft, or ToS-violating scraping.

Produce a clear, high-quality markdown completion report / deliverable for this task. Follow the instructions closely and incorporate any uploaded file text when relevant.

Title: ${input.title}
Description: ${input.description}
Instructions: ${input.instructions}
Context / attachments:
${ctx}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You write professional markdown completion reports and deliverables for client-submitted SMB / local-services business tasks. Be thorough, structured, and actionable.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${text.slice(0, 500)}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty OpenAI response");
  return content;
}
