import { QuoteCard } from "@/components/quotes/card";
import {
  QuoteSearchForm,
  QuoteSearchSkeleton,
} from "@/components/quotes/search";
import { QuoteCardSkeleton } from "@/components/quotes/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { searchQuotes } from "@/lib/api/quotes";
import { getSession } from "@/lib/auth/server";
import { getUserSavedQuotes } from "@/lib/db/queries";
import { Suspense } from "react";

// Define the search page props
interface SearchPageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

// Helper function to generate pagination links
function generatePaginationItems(currentPage: number, totalPages: number) {
  const items = [];
  const maxVisiblePages = 5;

  // Always show first page
  items.push(1);

  if (totalPages <= maxVisiblePages) {
    // If we have 5 or fewer pages, show all of them
    for (let i = 2; i <= totalPages; i++) {
      items.push(i);
    }
  } else {
    // More complex pagination with ellipsis
    if (currentPage > 3) {
      items.push("ellipsis-start");
    }

    // Pages around current page
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      if (i < totalPages) {
        items.push(i);
      }
    }

    if (currentPage < totalPages - 2) {
      items.push("ellipsis-end");
    }

    // Always show last page if we have more than one page
    if (totalPages > 1) {
      items.push(totalPages);
    }
  }

  return items;
}

// Component to display search results
async function SearchResults({
  keywords,
  author,
  lengths,
  page = "1",
}: {
  keywords?: string;
  author?: string;
  lengths?: string;
  page?: string;
}) {
  // Fetch all saved quotes for the current user
  const { quotes, savedQuotesMap } = await getUserSavedQuotes();
  const { user } = await getSession();
  const userId = user?.id;

  // Parse the lengths parameter
  const lengthsArray = lengths
    ? (lengths
        .split(",")
        .filter((l) => ["short", "medium", "long"].includes(l)) as (
        | "short"
        | "medium"
        | "long"
      )[])
    : [];

  // Search for quotes using the server-side API
  const allQuotes = await searchQuotes({
    keywords,
    author,
    lengths: lengthsArray,
  });

  if (allQuotes.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-4">No quotes found</h2>
        <p className="text-muted-foreground mb-6">
          Try adjusting your search criteria to find more quotes.
        </p>
      </div>
    );
  }

  // Pagination logic
  const quotesPerPage = 12;
  const currentPage = parseInt(page) || 1;
  const totalQuotes = allQuotes.length;
  const totalPages = Math.ceil(totalQuotes / quotesPerPage);

  // Get the quotes for the current page
  const startIndex = (currentPage - 1) * quotesPerPage;
  const endIndex = startIndex + quotesPerPage;
  const paginatedQuotes = allQuotes.slice(startIndex, endIndex);

  // Generate the pagination items
  const paginationItems = generatePaginationItems(currentPage, totalPages);

  // Build the base URL for pagination links
  const baseUrl = `/quotes/search?${new URLSearchParams({
    ...(keywords ? { keywords } : {}),
    ...(author ? { author } : {}),
    ...(lengths ? { lengths } : {}),
  }).toString()}`;

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col justify-end items-end flex-wrap gap-0.5">
        <p className="text-lg font-semibold">
          Found {totalQuotes} quote{totalQuotes !== 1 ? "s" : ""}
        </p>
        <p className="text-muted-foreground text-sm">
          {totalQuotes > quotesPerPage && (
            <span className="text-muted-foreground font-normal ml-2">
              (showing {startIndex + 1} - {Math.min(endIndex, totalQuotes)} of{" "}
              {totalQuotes})
            </span>
          )}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        {paginatedQuotes.map((quote, index) => {
          // Check if this quote is saved using our map
          const isSaved = savedQuotesMap.has(`${quote.quote}|${quote.author}`);
          return (
            <QuoteCard
              key={index}
              quote={quote}
              initialSavedState={isSaved}
              savedQuotesMap={savedQuotesMap}
            />
          );
        })}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious
                  href={`${baseUrl}&page=${currentPage - 1}`}
                />
              </PaginationItem>
            )}

            {paginationItems.map((item, index) => {
              if (item === "ellipsis-start" || item === "ellipsis-end") {
                return (
                  <PaginationItem key={item}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }

              return (
                <PaginationItem key={index}>
                  <PaginationLink
                    href={`${baseUrl}&page=${item}`}
                    isActive={currentPage === item}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext href={`${baseUrl}&page=${currentPage + 1}`} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

// Main search page component
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { keywords, author, lengths, page } = (await searchParams) as {
    [key: string]: string;
  };

  return (
    <main className="max-w-[calc(100vw-2rem)] py-8 mx-auto w-full">
      <div className="flex flex-col md:flex-row gap-4 px-4">
        {/* Sidebar with search form */}
        <div className="md:w-1/3 lg:w-1/4">
          <div className="sticky top-8">
            <Suspense fallback={<QuoteSearchSkeleton />}>
              <QuoteSearchForm
                initialKeywords={keywords}
                initialAuthor={author}
                initialLengths={
                  lengths ? lengths.split(",") : ["short", "medium", "long"]
                }
              />
            </Suspense>
          </div>
        </div>

        {/* Main content area */}
        <div className="md:w-2/3 lg:w-3/4">
          <div className="mb-2">
            <header className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold">Search Results</h1>
            </header>
            <div className="text-muted-foreground space-y-0.5">
              {keywords && (
                <p className="text-sm">
                  <span className="font-semibold">Keywords:</span>{" "}
                  <span className="italic text-neutral-400">
                    &quot;{keywords}&quot;
                  </span>
                </p>
              )}
              {author && (
                <p className="text-sm">
                  <span className="font-semibold">Author:</span>{" "}
                  <span className="italic text-neutral-400">{author}</span>
                </p>
              )}
              {lengths && (
                <p className="text-sm">
                  <span className="font-semibold">Length: </span>
                  <span className="italic text-neutral-400">
                    {lengths
                      .split(",")
                      .map((l) => {
                        if (l === "short") return "Short";
                        if (l === "medium") return "Medium";
                        if (l === "long") return "Long";
                        return l;
                      })
                      .join(", ")}
                  </span>
                </p>
              )}
            </div>
          </div>

          <Suspense
            fallback={
              <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 mt-12 lg:mt-24">
                {Array.from({ length: 6 }).map((_, index) => (
                  <QuoteCardSkeleton key={index} />
                ))}
              </div>
            }
          >
            <SearchResults
              keywords={keywords}
              author={author}
              lengths={lengths}
              page={page}
            />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
