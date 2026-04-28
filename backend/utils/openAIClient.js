import dotenv from "dotenv";

dotenv.config({ quiet: true });

const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
const isOpenRouterKey = apiKey?.startsWith("sk-or-");

export const aiModel = process.env.OPENAI_MODEL || (isOpenRouterKey ? "openai/gpt-4o-mini" : "gpt-4o-mini");
const baseUrl = process.env.OPENAI_BASE_URL || (isOpenRouterKey ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1");

export function isAiConfigured() {
  return Boolean(apiKey);
}

export async function chatCompletionText(messages, options = {}) {
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set in environment variables.");
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(isOpenRouterKey
        ? {
            "HTTP-Referer": process.env.APP_URL || "http://localhost:5000",
            "X-Title": "Smart Classroom",
          }
        : {}),
    },
    body: JSON.stringify({
      model: options.model || aiModel,
      messages,
      temperature: options.temperature ?? 0.3,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.error?.message || data?.message || response.statusText;
    throw new Error(`AI request failed (${response.status}): ${message}`);
  }

  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("AI response did not include any text.");
  }

  return text;
}
