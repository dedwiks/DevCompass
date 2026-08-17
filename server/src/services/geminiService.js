import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = "gemini-2.0-flash";

function buildPrompt(owner, name, windowDays, activity) {
  return `You are generating a concise engineering standup summary for the GitHub repository ${owner}/${name}, covering the last ${windowDays} day(s).

Below is the raw recent activity data. Base your summary ONLY on this data — do not invent commits, PRs, issues, or contributors that are not listed. If a category has no data, leave the corresponding array empty.

COMMITS:
${JSON.stringify(activity.commits, null, 2)}

PULL REQUESTS:
${JSON.stringify(activity.prs, null, 2)}

ISSUES:
${JSON.stringify(activity.issues, null, 2)}

Respond with ONLY strict JSON (no markdown fences, no commentary) in exactly this shape:
{
  "highlights": ["short bullet strings of notable completed work"],
  "inProgress": ["short bullet strings of work still in flight, e.g. open PRs"],
  "blockers": ["short bullet strings of anything that looks stuck or blocked, empty array if none is evident"],
  "summaryText": "a 2-4 sentence natural language paragraph summarizing the period"
}`;
}

function stripCodeFences(text) {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenceMatch ? fenceMatch[1] : trimmed;
}

function fallbackResult(rawText) {
  return {
    highlights: [],
    inProgress: [],
    blockers: [],
    summaryText: rawText?.trim() || "Summary generation returned an unparseable response.",
  };
}

export async function generateSummary(owner, name, windowDays, activity) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = buildPrompt(owner, name, windowDays, activity);
  const result = await model.generateContent(prompt);
  const rawText = result.response.text();

  try {
    const parsed = JSON.parse(stripCodeFences(rawText));
    return {
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
      inProgress: Array.isArray(parsed.inProgress) ? parsed.inProgress : [],
      blockers: Array.isArray(parsed.blockers) ? parsed.blockers : [],
      summaryText: typeof parsed.summaryText === "string" ? parsed.summaryText : "",
    };
  } catch {
    return fallbackResult(rawText);
  }
}
