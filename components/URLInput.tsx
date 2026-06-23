// components/URLInput.tsx
// A simple form with a text input and a button.
// The parent page owns the actual state and logic; this component
// just displays the input and tells the parent when the user submits.

"use client";

import { FormEvent } from "react";

interface URLInputProps {
  url: string;
  onUrlChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function URLInput({
  url,
  onUrlChange,
  onSubmit,
  isLoading,
}: URLInputProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isLoading) {
      onSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 w-full"
    >
      <input
        type="text"
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="e.g. https://www.example.com"
        disabled={isLoading}
        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                   px-4 py-3 text-base outline-none
                   focus:ring-2 focus:ring-blue-500
                   disabled:opacity-60 disabled:cursor-not-allowed"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="rounded-lg bg-blue-600 hover:bg-blue-700
                   disabled:bg-blue-400 disabled:cursor-not-allowed
                   text-white font-medium px-6 py-3 transition-colors
                   whitespace-nowrap"
      >
        {isLoading ? "Analyzing..." : "Analyze Startup"}
      </button>
    </form>
  );
}
