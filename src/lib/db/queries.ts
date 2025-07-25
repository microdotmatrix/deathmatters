import { UnifiedQuote } from "@/types/quotes";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { getSession } from "../auth/server";
import { db } from "../db";
import { deceased, savedQuotes, userUpload } from "./schema";

export const getCreatorEntries = cache(async () => {
  const session = await getSession();

  if (!session?.user) {
    return [];
  }

  const entries = await db.query.deceased.findMany({
    where: eq(deceased.userId, session.user.id),
    orderBy: (deceased, { desc }) => [desc(deceased.createdAt)],
  });

  return entries;
});

export const getEntryById = cache(async (entryId: string) => {
  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  const entry = await db.query.deceased.findFirst({
    where: (deceased, { eq, and }) =>
      and(eq(deceased.id, entryId), eq(deceased.userId, session.user.id)),
  });

  return entry;
});

export const getUserUploads = cache(async () => {
  const session = await getSession();

  if (!session?.user) {
    return [];
  }

  // Fetch all uploads for this user
  const uploads = await db.query.userUpload.findMany({
    where: eq(userUpload.userId, session.user.id),
    orderBy: (uploads, { desc }) => [desc(uploads.createdAt)],
  });

  return uploads;
});

/**
 * Get all saved quotes for the current user
 * Returns an array of quote identifiers (quote text and author)
 */
export const getUserSavedQuotes: () => Promise<{
  quotes: UnifiedQuote[];
  savedQuotesMap: Map<string, boolean>;
}> = async () => {
  // Get the current session
  const session = await getSession();

  if (!session || !session.user) {
    return { quotes: [], savedQuotesMap: new Map() };
  }

  try {
    const userId = session.user.id;

    const result = await db.query.savedQuotes.findMany({
      where: eq(savedQuotes.userId, userId),
      orderBy: (savedQuotes, { desc }) => [desc(savedQuotes.createdAt)],
    });

    const savedQuotesMap = new Map<string, boolean>();

    result.forEach((sq) => {
      const key = `${sq.quote}|${sq.author}`;
      savedQuotesMap.set(key, true);
    });

    // Convert saved quotes to UnifiedQuote format for the QuoteCard component
    const quotes: UnifiedQuote[] = result.map((sq) => ({
      quote: sq.quote,
      author: sq.author,
      source: "Saved Quote", // Default source for saved quotes
      length: sq.quote.length,
    }));

    return { quotes, savedQuotesMap };
  } catch (error) {
    console.error("Error fetching saved quotes:", error);
    return { quotes: [], savedQuotesMap: new Map() };
  }
};
