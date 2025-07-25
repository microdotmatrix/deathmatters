"use server";

import { TAGS } from "@/lib/cache";
import { db } from "@/lib/db";
import { savedQuotes } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { cache } from "react";
import { getSession } from "../auth/server";

// Type for saved quote identifiers
export type SavedQuoteIdentifier = {
  quote: string;
  author: string;
};

/**
 * Save a quote to the user's saved quotes
 */
export const saveQuote = async (quote: string, author: string) => {
  // Get the current session
  const session = await getSession();

  if (!session || !session.user) {
    return {
      success: false,
      message: "You must be logged in to save quotes",
    };
  }

  try {
    await db.insert(savedQuotes).values({
      userId: session.user.id,
      quote,
      author,
    });

    revalidateTag(TAGS.userSavedQuotes);

    return {
      success: true,
      message: "Quote saved successfully",
    };
  } catch (error) {
    console.error("Error saving quote:", error);
    return {
      success: false,
      message: "Failed to save quote",
    };
  }
};

/**
 * Check if a quote is saved by the current user
 * This is kept for backward compatibility but should be avoided in lists
 * where multiple quotes need to be checked
 */
export const isQuoteSaved = cache(async (quote: string, author: string) => {
  // Get the current session
  const session = await getSession();

  if (!session || !session.user) {
    return false;
  }

  try {
    const userId = session.user.id;

    const result = await db.query.savedQuotes.findMany({
      where: and(
        eq(savedQuotes.userId, userId),
        eq(savedQuotes.quote, quote),
        eq(savedQuotes.author, author)
      ),
    });

    // Check if count is greater than 0
    const count = result.length;
    return count > 0;
  } catch (error) {
    console.error("Error checking if quote is saved:", error);
    return false;
  }
});

/**
 * Remove a quote from the user's saved quotes
 */
export const removeQuote = async (quote: string, author: string) => {
  // Get the current session
  const session = await getSession();

  if (!session || !session.user) {
    return {
      success: false,
      message: "You must be logged in to remove quotes",
    };
  }

  try {
    await db
      .delete(savedQuotes)
      .where(
        and(
          eq(savedQuotes.userId, session.user.id),
          eq(savedQuotes.quote, quote),
          eq(savedQuotes.author, author)
        )
      );

    revalidateTag(TAGS.userSavedQuotes);

    return {
      success: true,
      message: "Quote removed successfully",
    };
  } catch (error) {
    console.error("Error removing quote:", error);
    return {
      success: false,
      message: "Failed to remove quote",
    };
  }
};
