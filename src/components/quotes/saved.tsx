import { QuoteCard } from "@/components/quotes/card";
import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getUserSavedQuotes } from "@/lib/db/queries";
import Link from "next/link";
/**
 * Server component that fetches and displays the user's saved quotes
 */
export async function SavedQuotes() {
  // Fetch all saved quotes for the current user
  const { quotes, savedQuotesMap } = await getUserSavedQuotes();

  // If no saved quotes, show empty state
  if (quotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Icon
          icon="carbon:quotes"
          className="size-12 mb-4 text-muted-foreground"
        />
        <p className="text-muted-foreground">
          Your saved quotes will appear here
        </p>
        <Link
          href="/quotes/search"
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "mt-4",
          })}
        >
          Browse Quotes
        </Link>
      </div>
    );
  }

  // Display saved quotes in a grid
  return (
    <div className="space-y-4">
      <ScrollArea className="h-[480px]">
        <div className="grid gap-2">
          {quotes.map((quote, index) => (
            <QuoteCard
              key={index}
              quote={quote}
              initialSavedState={true} // All quotes here are saved
              savedQuotesMap={savedQuotesMap}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Link to browse more quotes */}
      <div className="flex justify-center mt-6">
        <Link
          href="/quotes/search"
          className={buttonVariants({
            variant: "outline",
            size: "sm",
          })}
        >
          Browse More Quotes
        </Link>
      </div>
    </div>
  );
}
