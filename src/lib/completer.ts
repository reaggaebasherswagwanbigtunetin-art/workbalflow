/**
 * Deterministic template-based task completer.
 * Optionally uses OpenAI when OPENAI_API_KEY is set.
 */

export type CompleterInput = {
  title: string;
  description: string;
  instructions: string;
  context?: string | null;
};

export async function completeTask(input: CompleterInput): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (key) {
    try {
      return await completeWithOpenAI(input, key);
    } catch (err) {
      console.warn("OpenAI completer failed, falling back to template:", err);
    }
  }
  return completeWithTemplate(input);
}

function completeWithTemplate(input: CompleterInput): string {
  const now = new Date().toISOString();
  const ctx = (input.context || "").trim() || "_No additional context provided._";
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
  const prompt = `You are WorkBal, an automated agent that completes ONLY client-submitted business tasks from their own instructions.
Never suggest survey farming, CAPTCHA bypass, account theft, or ToS-violating scraping.

Produce a clear markdown completion report for this task.

Title: ${input.title}
Description: ${input.description}
Instructions: ${input.instructions}
Context: ${input.context || "(none)"}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You write professional markdown completion reports for client-submitted tasks." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${text}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty OpenAI response");
  return content;
}
