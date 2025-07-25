import {
  QuoteSearchForm,
  QuoteSearchSkeleton,
} from "@/components/quotes/search";
import { Card, CardContent } from "@/components/ui/card";
import { Suspense } from "react";

export default function Quotes() {
  return (
    <main className="py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Search for Quotes</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore famous quotes, sayings, and phrases from history's greatest
          minds. Find inspiration by keyword, author, or quote length.
        </p>
      </div>

      <div className="mb-12 container mx-auto max-w-2xl">
        <Suspense fallback={<QuoteSearchSkeleton />}>
          <QuoteSearchForm />
        </Suspense>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 container mx-auto max-w-screen-xl">
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Search by Keywords</h3>
            <p className="text-muted-foreground">
              Find quotes containing specific words or phrases that resonate
              with you.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Filter by Author</h3>
            <p className="text-muted-foreground">
              Discover wisdom from your favorite philosophers, leaders, and
              thinkers.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold mb-2">Choose Quote Length</h3>
            <p className="text-muted-foreground">
              Find the perfect quote for any occasion - from brief sayings to
              profound passages.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
