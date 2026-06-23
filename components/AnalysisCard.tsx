// components/AnalysisCard.tsx
// A reusable card used to display one section of the analysis
// (e.g. Business Model, SWOT, Competitors). Keeping this generic
// means we can reuse the same component for every section.

import { ReactNode } from "react";

interface AnalysisCardProps {
  title: string;
  emoji?: string;
  children: ReactNode;
}

export default function AnalysisCard({ title, emoji, children }: AnalysisCardProps) {
  return (
    <div
      className="rounded-xl border border-gray-200 dark:border-gray-700
                 bg-white dark:bg-gray-800 p-5 shadow-sm
                 hover:shadow-md transition-shadow"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
        {emoji && <span aria-hidden>{emoji}</span>}
        {title}
      </h3>
      <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
}

/**
 * Small helper component for rendering a bullet list inside a card.
 * Exported separately so the main page can use it directly.
 */
export function BulletList({ items }: { items: string[] }) {
  if (!items || items.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400 italic">No data available.</p>;
  }

  return (
    <ul className="list-disc list-inside space-y-1.5">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}
