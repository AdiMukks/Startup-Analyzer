// lib/gemini.ts
// Handles all communication with Google's Gemini API.
// We ask Gemini to act as a startup analyst and return strict JSON,
// then we parse and validate that JSON before sending it to the frontend.

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AnalysisResult } from "@/types/analysis";

const MODEL_NAME = "gemini-2.0-flash";

/**
 * Builds the prompt we send to Gemini. We are very explicit about the
 * JSON shape we want back, since Gemini's reply will be parsed by code.
 */
function buildPrompt(websiteText: string): string {
  return `You are an expert startup and venture-capital analyst.

Below is text extracted from a startup's website. Read it carefully and
produce a structured analysis.

WEBSITE TEXT:
"""
${websiteText}
"""

Respond with ONLY a valid JSON object (no markdown, no code fences, no extra
commentary) that exactly matches this shape:

{
  "businessModel": "A short paragraph covering: the problem solved, target customers, the product/service, and the revenue model.",
  "strengths": ["string", "..."],
  "weaknesses": ["string", "..."],
  "opportunities": ["string", "..."],
  "threats": ["string", "..."],
  "revenueOpportunities": ["string describing a new revenue stream or upsell idea", "..."],
  "competitors": ["string naming a likely direct competitor", "..."],
  "advantages": ["string describing a competitive advantage", "..."],
  "investmentScore": 0,
  "reasoning": "A short explanation (2-4 sentences) for the investment score."
}

Rules:
- "investmentScore" must be a whole number between 0 and 100.
- Every array should have at least 3 items when possible.
- Keep each string concise (one sentence each).
- Return ONLY the JSON object, nothing else.`;
}

/**
 * Strips common formatting Gemini sometimes adds (like ```json fences)
 * so we can safely run JSON.parse on the response.
 */
function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/, "");
  cleaned = cleaned.replace(/```\s*$/, "");
  return cleaned.trim();
}

/**
 * Makes sure the parsed object actually has the fields we expect,
 * filling in safe defaults for anything missing. This protects the
 * frontend from crashing if Gemini's output is slightly off.
 */
function toSafeAnalysisResult(data: unknown): AnalysisResult {
  const d = (data ?? {}) as Partial<AnalysisResult>;

  const asStringArray = (value: unknown): string[] =>
    Array.isArray(value) ? value.filter((v) => typeof v === "string") : [];

  let score = typeof d.investmentScore === "number" ? d.investmentScore : 0;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    businessModel:
      typeof d.businessModel === "string" && d.businessModel.length > 0
        ? d.businessModel
        : "No business model summary was returned.",
    strengths: asStringArray(d.strengths),
    weaknesses: asStringArray(d.weaknesses),
    opportunities: asStringArray(d.opportunities),
    threats: asStringArray(d.threats),
    revenueOpportunities: asStringArray(d.revenueOpportunities),
    competitors: asStringArray(d.competitors),
    advantages: asStringArray(d.advantages),
    investmentScore: score,
    reasoning:
      typeof d.reasoning === "string" && d.reasoning.length > 0
        ? d.reasoning
        : "No reasoning was returned.",
  };
}

/**
 * Sends the extracted website text to Gemini and returns a clean,
 * typed AnalysisResult. Throws a friendly Error if anything fails.
 */
export async function analyzeWebsiteText(
  websiteText: string
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Server is missing GEMINI_API_KEY. Please add it to your environment variables."
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
  });

  let rawText: string;

  try {
    const result = await model.generateContent(buildPrompt(websiteText));

    rawText = result.response.text();

    console.log("Gemini raw response:", rawText);
  } catch (error) {
    console.error("Gemini API request failed:", error);

    // Expose the real error to Vercel logs
    throw error;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(cleanJsonResponse(rawText));
  } catch (error) {
    console.error(
      "Failed to parse Gemini response as JSON:",
      rawText,
      error
    );

    throw new Error(
      "The AI returned an unexpected response. Please try again."
    );
  }

  return toSafeAnalysisResult(parsed);
}
