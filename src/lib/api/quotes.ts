import type { LengthFilter, SearchParams, UnifiedQuote } from "@/types/quotes";
import {
  filterMockQuotesByAuthor,
  filterMockQuotesByKeyword,
  mockQuotes,
} from "./mock";

const STANDS4_UID = process.env.STANDS4_UID;
const STANDS4_TOKENID = process.env.STANDS4_TOKENID;

// Search for quotes using the Stands4.com Quotes API
export async function searchQuotesByKeyword(keyword: string) {
  const response = await fetch(
    `https://www.stands4.com/services/v2/quotes.php?uid=${STANDS4_UID}&tokenid=${STANDS4_TOKENID}&searchtype=SEARCH&query=${encodeURIComponent(
      keyword
    )}&format=json`
  );
  const json = await response.json();
  return json.result.map((item: { quote: string; author: string }) => ({
    quote: item.quote,
    author: item.author || "Unknown",
    source: "Stands4.com",
    length: item.quote?.length || 0,
  }));
}

export async function searchQuotesByAuthor(author: string) {
  const response = await fetch(
    `https://www.stands4.com/services/v2/quotes.php?uid=${STANDS4_UID}&tokenid=${STANDS4_TOKENID}&searchtype=AUTHOR&query=${encodeURIComponent(
      author
    )}&format=json`
  );
  const json = await response.json();
  return json.result.map((item: { quote: string; author: string }) => ({
    quote: item.quote,
    author: item.author || "Unknown",
    source: "Stands4.com",
    length: item.quote?.length || 0,
  }));
}

// Search for parables/famous phrases using ZenQuotes API (returns random if no keyword, so we filter manually)
export async function searchParablesByKeyword(keyword: string) {
  // ZenQuotes does not support keyword search directly, so fetch a batch and filter
  const response = await fetch("https://zenquotes.io/api/quotes");
  if (!response.ok) throw new Error("Failed to fetch parables");
  const json = await response.json();
  // Format data to match our expected schema
  const data = json.map((item: any) => ({
    quote: item.q,
    author: item.a || "Unknown",
    source: "ZenQuotes",
    length: item.q?.length || 0,
  }));
  // Filter quotes containing the keyword (case-insensitive)
  return data.filter(
    (item: any) =>
      item.quote.toLowerCase().includes(keyword.toLowerCase()) ||
      (item.author && item.author.toLowerCase().includes(keyword.toLowerCase()))
  );
}

// Search for lyrics using the Lyrics.ovh API (returns lyrics for a song, so we use keyword as song or artist)
export async function searchLyricsByKeyword(keyword: string) {
  // Lyrics.ovh does not support search, so we use lyrics-api (lyrics-api.com) as a public alternative
  const response = await fetch(
    `https://api.lyrics.ovh/v1/${encodeURIComponent(
      keyword
    )}/${encodeURIComponent(keyword)}`
  );
  // Note: This API expects artist and title, but for demo purposes, we use keyword for both
  if (!response.ok) throw new Error("Failed to fetch lyrics");
  return response.json();
}

export async function searchAllQuotes(keyword: string) {
  const [parables, quotes] = await Promise.all([
    searchParablesByKeyword(keyword),
    searchQuotesByKeyword(keyword),
  ]);

  return [...parables, ...quotes];
}

// Helper function to filter quotes by length
function filterByLength(
  quotes: UnifiedQuote[],
  lengths: LengthFilter[]
): UnifiedQuote[] {
  if (!lengths || lengths.length === 0) return quotes;

  return quotes.filter((quote) => {
    if (lengths.includes("short") && quote.length <= 75) return true;
    if (lengths.includes("medium") && quote.length > 75 && quote.length <= 150)
      return true;
    if (lengths.includes("long") && quote.length > 150) return true;
    return false;
  });
}

// Main search function that combines all filters
export async function searchQuotes(
  params: SearchParams
): Promise<UnifiedQuote[]> {
  const { keywords, author, lengths } = params;

  // If no search parameters are provided, return all quotes
  if (!keywords && !author && (!lengths || lengths.length === 0)) {
    return mockQuotes;
  }

  let results: UnifiedQuote[] = [];

  // Search by keyword if provided
  if (keywords) {
    // Split keywords by comma and trim whitespace
    const keywordArray = keywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (keywordArray.length > 0) {
      // Create a Set to track unique quotes (by quote text) that match any keyword
      const uniqueQuotes = new Set<string>();
      const allKeywordResults: UnifiedQuote[] = [];

      // Process each keyword and collect matching quotes
      for (const keyword of keywordArray) {
        const keywordResults = await filterMockQuotesByKeyword(keyword);

        // Add each quote to our results if we haven't seen it before
        for (const quote of keywordResults) {
          if (!uniqueQuotes.has(quote.quote)) {
            uniqueQuotes.add(quote.quote);
            allKeywordResults.push(quote);
          }
        }
      }

      // Set the results to all quotes that matched any keyword
      results = allKeywordResults;
    }
  }

  // Search by author if provided
  if (author) {
    const authorResults = await filterMockQuotesByAuthor(author);

    // If we already have keyword results, find the intersection
    if (results.length > 0) {
      // Create a map of existing quotes for faster lookup
      const existingQuotes = new Map(
        results.map((quote: UnifiedQuote) => [quote.quote, quote])
      );

      // Only keep quotes that match both keyword and author
      results = authorResults.filter((quote: UnifiedQuote) =>
        existingQuotes.has(quote.quote)
      );
    } else {
      // If no keyword search was done, just use author results
      results = authorResults;
    }
  }

  // If neither keyword nor author was provided, use all quotes
  if (!keywords && !author) {
    results = [...mockQuotes];
  }

  // Apply length filters if provided
  if (lengths && lengths.length > 0) {
    results = filterByLength(results, lengths);
  }

  return results;
}
