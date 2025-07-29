import { UnifiedQuote } from "@/types/quotes";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { getSession } from "../auth/server";
import { db } from "../db";
import {
  deceased,
  obituaries,
  obituariesDraft,
  Obituary,
  ObituaryDraft,
  savedQuotes,
  userUpload,
  userGeneratedImage,
  UserGeneratedImage,
} from "./schema";

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

export const getUserObituaries: () => Promise<Obituary[]> = async () => {
  const session = await getSession();

  if (!session || !session.user) {
    return [];
  }

  try {
    const userId = session.user.id;

    const result = await db.query.obituaries.findMany({
      where: eq(obituaries.userId, userId),
      orderBy: (obituaries, { desc }) => [desc(obituaries.createdAt)],
    });

    return result;
  } catch (error) {
    console.error("Error fetching obituaries:", error);
    return [];
  }
};

export const getUserObituariesDraft: () => Promise<
  ObituaryDraft[]
> = async () => {
  const session = await getSession();

  if (!session || !session.user) {
    return [];
  }

  try {
    const userId = session.user.id;

    const result = await db.query.obituariesDraft.findMany({
      where: eq(obituariesDraft.userId, userId),
      orderBy: (obituariesDraft, { desc }) => [desc(obituariesDraft.updatedAt)],
    });

    return result;
  } catch (error) {
    console.error("Error fetching obituaries:", error);
    return [];
  }
};

export const getUserObituary = async (id: string) => {
  const session = await getSession();

  if (!session || !session.user) {
    return null;
  }

  try {
    const userId = session.user.id;

    const result = await db.query.obituaries.findFirst({
      where: (obituaries, { eq, and }) =>
        and(
          eq(obituaries.id, id),
          eq(obituaries.userId, userId)
        ),
    });

    return result;
  } catch (error) {
    console.error("Error fetching obituary:", error);
    return null;
  }
};

export const getObituariesByDeceasedId = cache(async (deceasedId: string) => {
  const session = await getSession();

  if (!session?.user) {
    return [];
  }

  try {
    const result = await db.query.obituaries.findMany({
      where: (obituaries, { eq, and }) =>
        and(
          eq(obituaries.deceasedId, deceasedId),
          eq(obituaries.userId, session.user.id)
        ),
      orderBy: (obituaries, { desc }) => [desc(obituaries.createdAt)],
    });

    return result;
  } catch (error) {
    console.error("Error fetching obituaries by deceased ID:", error);
    return [];
  }
});

export const getGeneratedImagesByDeceasedId = cache(async (deceasedId: string) => {
  const session = await getSession();

  if (!session?.user) {
    return [];
  }

  try {
    const result = await db.query.userGeneratedImage.findMany({
      where: (userGeneratedImage, { eq, and }) =>
        and(
          eq(userGeneratedImage.deceasedId, deceasedId),
          eq(userGeneratedImage.userId, session.user.id)
        ),
      orderBy: (userGeneratedImage, { desc }) => [desc(userGeneratedImage.createdAt)],
    });

    return result;
  } catch (error) {
    console.error("Error fetching generated images by deceased ID:", error);
    return [];
  }
});
