import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export function QuoteCardSkeleton() {
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow relative">
      <CardHeader>
        <Skeleton className="h-12 w-full animate-pulse bg-popover/50" />
      </CardHeader>
      <CardContent className="flex-grow">
        <Skeleton className="h-24 w-full animate-pulse bg-popover/50" />
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Skeleton className="h-4 w-24 animate-pulse bg-popover/50" />
        <Skeleton className="h-4 w-24 animate-pulse bg-popover/50" />
      </CardFooter>
    </Card>
  );
}
