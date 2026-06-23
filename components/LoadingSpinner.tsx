// components/LoadingSpinner.tsx
// A small spinning loader shown while we wait for the analysis.

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div
        className="h-10 w-10 rounded-full border-4 border-gray-300 dark:border-gray-700
                   border-t-blue-600 animate-spin"
        role="status"
        aria-label="Loading"
      />
      <p className="text-gray-600 dark:text-gray-400 text-sm">
        Reading the website and asking Gemini to analyze it...
      </p>
    </div>
  );
}
