// app/page.tsx
// The main page of the AI Startup Analyzer.
// It holds all the state (URL, loading, result, error) and renders
// the input box, loading spinner, error message, and result cards.

"use client";

import { useState } from "react";
import URLInput from "@/components/URLInput";
import LoadingSpinner from "@/components/LoadingSpinner";
import AnalysisCard, { BulletList } from "@/components/AnalysisCard";
import type { AnalysisResult, ApiErrorResponse } from "@/types/analysis";

export default function Home() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setError(null);
    setResult(null);

    if (!url.trim()) {
      setError("Please enter a website URL first.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as ApiErrorResponse;
        throw new Error(errorData.error || "Something went wrong.");
      }

      setResult(data as AnalysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-10 sm:py-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            🚀 AI Startup Analyzer
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter a startup&apos;s website URL and let Gemini analyze its business
            model, SWOT, revenue ideas, competitors, and investment potential.
          </p>
        </div>

        {/* Input */}
        <div className="mb-6">
          <URLInput
            url={url}
            onUrlChange={setUrl}
            onSubmit={handleAnalyze}
            isLoading={isLoading}
          />
        </div>

        {/* Error message */}
        {error && (
          <div
            className="mb-6 rounded-lg border border-red-300 dark:border-red-700
                       bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300
                       px-4 py-3 text-sm"
          >
            {error}
          </div>
        )}

        {/* Loading state */}
        {isLoading && <LoadingSpinner />}

        {/* Results */}
        {result && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Business Model */}
            <div className="md:col-span-2">
              <AnalysisCard title="Business Model" emoji="🧩">
                <p>{result.businessModel}</p>
              </AnalysisCard>
            </div>

            {/* Investment Score */}
            <div className="md:col-span-2">
              <AnalysisCard title="Investment Score" emoji="📊">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {result.investmentScore}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">/ 100</span>
                </div>
                <p>{result.reasoning}</p>
              </AnalysisCard>
            </div>

            {/* SWOT Analysis */}
            <AnalysisCard title="Strengths" emoji="💪">
              <BulletList items={result.strengths} />
            </AnalysisCard>
            <AnalysisCard title="Weaknesses" emoji="⚠️">
              <BulletList items={result.weaknesses} />
            </AnalysisCard>
            <AnalysisCard title="Opportunities" emoji="🌱">
              <BulletList items={result.opportunities} />
            </AnalysisCard>
            <AnalysisCard title="Threats" emoji="🔥">
              <BulletList items={result.threats} />
            </AnalysisCard>

            {/* Revenue Opportunities */}
            <AnalysisCard title="Revenue Opportunities" emoji="💰">
              <BulletList items={result.revenueOpportunities} />
            </AnalysisCard>

            {/* Competitor Analysis */}
            <AnalysisCard title="Direct Competitors" emoji="🏁">
              <BulletList items={result.competitors} />
            </AnalysisCard>

            <div className="md:col-span-2">
              <AnalysisCard title="Competitive Advantages" emoji="🛡️">
                <BulletList items={result.advantages} />
              </AnalysisCard>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
