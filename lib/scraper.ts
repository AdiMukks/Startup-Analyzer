// lib/scraper.ts
// Small helper that fetches a webpage and pulls out the readable text.
// We keep this simple on purpose: grab the HTML, remove scripts/styles,
// and return the plain text so we can hand it to Gemini.

import * as cheerio from "cheerio";

/**
 * Makes sure the string the user typed looks like a real, fetchable URL.
 * If it's missing "http://" or "https://", we add "https://" for them.
 */
export function normalizeUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

/**
 * Checks whether a string is a valid URL we can actually fetch.
 */
export function isValidUrl(rawUrl: string): boolean {
  try {
    const url = new URL(normalizeUrl(rawUrl));
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Fetches the given URL and extracts visible text content from the page.
 * Throws an Error with a friendly message if anything goes wrong.
 */
export async function extractTextFromUrl(rawUrl: string): Promise<string> {
  const url = normalizeUrl(rawUrl);

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        // Some sites block requests with no User-Agent header.
        "User-Agent":
          "Mozilla/5.0 (compatible; StartupAnalyzerBot/1.0; +https://example.com)",
      },
      // Avoid hanging forever on a slow/unresponsive site.
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new Error(
      "Could not reach that website. Please check the URL and try again."
    );
  }

  if (!response.ok) {
    throw new Error(
      `The website responded with an error (status ${response.status}).`
    );
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove elements that don't contain useful readable content.
  $("script, style, noscript, svg, iframe, header nav, footer nav").remove();

  // Grab text from common content-holding tags.
  const text = $("body").text();

  // Collapse extra whitespace/newlines into single spaces.
  const cleanedText = text.replace(/\s+/g, " ").trim();

  if (!cleanedText || cleanedText.length < 50) {
    throw new Error(
      "We couldn't find enough readable text on that website to analyze."
    );
  }

  // Gemini doesn't need an enormous wall of text — trim to a safe size.
  const MAX_CHARS = 15000;
  return cleanedText.length > MAX_CHARS
    ? cleanedText.slice(0, MAX_CHARS)
    : cleanedText;
}
