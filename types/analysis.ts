// Shared TypeScript types used across the app.
// Keeping all types in one file makes them easy to find and reuse.

/**
 * The shape of the analysis result that Gemini returns to us,
 * and that we show on the page.
 */
export interface AnalysisResult {
  businessModel: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  revenueOpportunities: string[];
  competitors: string[];
  advantages: string[];
  investmentScore: number;
  reasoning: string;
}

/**
 * The request body our API route expects from the frontend.
 */
export interface AnalyzeRequestBody {
  url: string;
}

/**
 * A generic error response shape, so the frontend always knows
 * where to look for an error message.
 */
export interface ApiErrorResponse {
  error: string;
}
