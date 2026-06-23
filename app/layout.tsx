import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Startup Analyzer",
  description:
    "Analyze any startup's website with Gemini AI: business model, SWOT, revenue ideas, competitors, and investment score.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
