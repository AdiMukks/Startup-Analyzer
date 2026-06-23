// app/api/analyze/route.ts
// This API route runs on the server. It receives a startup URL,
// scrapes the text from that website, sends it to Gemini, and
// returns the structured analysis as JSON.

import { NextRequest, NextResponse } from "next/server";
import { extractTextFromUrl, isValidUrl } from "@/lib/scraper";
import { analyzeWebsiteText } from "@/lib/gemini";
import type { AnalyzeRequestBody, ApiErrorResponse } from "@/types/analysis";

export async function POST(request: NextRequest) {
  let body: AnalyzeRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiErrorResponse>(
      { error: "Invalid request body. Expected JSON with a 'url' field." },
      { status: 400 }
    );
  }

  const url = body?.url?.trim();

  if (!url) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "Please enter a website URL." },
      { status: 400 }
    );
  }

  if (!isValidUrl(url)) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "That doesn't look like a valid URL. Please double-check it." },
      { status: 400 }
    );
  }

  try {
    // Step 1: Get the readable text from the website.
    const websiteText = await extractTextFromUrl(url);

    // Step 2: Send that text to Gemini for analysis.
    const analysis = await analyzeWebsiteText(websiteText);

    return NextResponse.json(analysis, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong while analyzing the website.";

    console.error("Analyze route error:", error);

    return NextResponse.json<ApiErrorResponse>({ error: message }, { status: 500 });
  }
}
