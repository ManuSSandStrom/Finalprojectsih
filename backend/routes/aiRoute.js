import { Router } from "express";
import dotenv from "dotenv";
import { chatCompletionText, isAiConfigured } from "../utils/openAIClient.js";

dotenv.config({ quiet: true });

export const aiRouter = Router();

aiRouter.post("/chat", async (req, res) => {
  try {
    if (!isAiConfigured()) {
      return res.status(503).json({
        error: "AI service is not configured. Set OPENAI_API_KEY in backend/.env.",
      });
    }

    const { message, context } = req.body;

    const systemPrompt = `You are an AI assistant for a Smart Classroom Scheduler application. 
You help users with scheduling questions.

Current context: ${JSON.stringify(context || {})}

Provide helpful, accurate responses about scheduling, timetable management, and educational administration.`;

    const text = await chatCompletionText([
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ]);

    res.json({ response: text });
  } catch (error) {
    console.error("AI Chat error:", error);
    res.status(500).json({ error: "Failed to process AI request" });
  }
});
