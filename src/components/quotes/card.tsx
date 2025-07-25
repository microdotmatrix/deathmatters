"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { isQuoteSaved, removeQuote, saveQuote } from "@/lib/actions/quotes";
import { UnifiedQuote } from "@/types/quotes";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

interface QuoteCardProps {
  quote: UnifiedQuote;
  // Optional props for optimization
  initialSavedState?: boolean;
  savedQuotesMap?: Map<string, boolean>;
  userId?: string;
}

export function QuoteCard({
  quote,
  initialSavedState,
  savedQuotesMap,
}: QuoteCardProps) {
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(initialSavedState || false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Only check if the quote is saved when we don't have the initial state
  useEffect(() => {
    // If we have initialSavedState, use it directly
    if (initialSavedState !== undefined) {
      setIsSaved(initialSavedState);
      return;
    }

    // If we have a savedQuotesMap, use it for quick lookup
    if (savedQuotesMap) {
      const key = `${quote.quote}|${quote.author}`;
      setIsSaved(savedQuotesMap.has(key));
      return;
    }

    // Fallback to API call only if we don't have the optimized props
    const checkIfSaved = async () => {
      const saved = await isQuoteSaved(quote.quote, quote.author);
      setIsSaved(saved);
    };

    checkIfSaved();
  }, [quote.quote, quote.author, initialSavedState, savedQuotesMap]);

  // Function to determine quote length category
  const getLengthCategory = (length: number) => {
    if (length <= 75) return "Short";
    if (length <= 150) return "Medium";
    return "Long";
  };

  // Function to copy quote to clipboard
  const copyToClipboard = async () => {
    try {
      const textToCopy = `"${quote.quote}" - ${quote.author}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success("Quote copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  // Function to toggle save/remove quote using React transitions
  const handleToggleSaveQuote = () => {
    startTransition(async () => {
      try {
        // If already saved, remove it; otherwise save it
        const result = isSaved
          ? await removeQuote(quote.quote, quote.author)
          : await saveQuote(quote.quote, quote.author);

        if (result.success) {
          startTransition(() => {
            toast.success(result.message);
            // Toggle the saved state
            setIsSaved(!isSaved);
            // Update the savedQuotesMap if it exists
            if (savedQuotesMap) {
              const key = `${quote.quote}|${quote.author}`;
              if (isSaved) {
                // Remove from map
                savedQuotesMap.delete(key);
              } else {
                // Add to map
                savedQuotesMap.set(key, true);
              }
            }
          });
        } else {
          toast.error(result.message);
          router.push("/auth/login");
        }
      } catch (error) {
        toast.error(
          isSaved ? "Failed to remove quote" : "Failed to save quote"
        );
        console.error(
          isSaved ? "Failed to remove quote:" : "Failed to save quote:",
          error
        );
      }
    });
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow relative">
      <div className="absolute top-2 right-2 flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="opacity-50 hover:opacity-100"
          onClick={copyToClipboard}
          title="Copy to clipboard"
        >
          {copied ? (
            <Icon icon="line-md:confirm" className="size-5" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-5"
            >
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="opacity-50 hover:opacity-100 disabled:opacity-50"
          onClick={handleToggleSaveQuote}
          disabled={isPending || !savedQuotesMap}
          title={isSaved ? "Remove from saved quotes" : "Save quote"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={isSaved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5"
          >
            {isPending ? (
              <path
                fill="currentColor"
                d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"
              >
                <animateTransform
                  attributeName="transform"
                  dur="1s"
                  repeatCount="indefinite"
                  type="rotate"
                  values="0 12 12;360 12 12"
                />
              </path>
            ) : (
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            )}
          </svg>
        </Button>
      </div>
      <CardHeader>
        <CardTitle className="text-lg font-medium">{quote.author}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground italic">"{quote.quote}"</p>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <span className="text-sm text-muted-foreground">{quote.source}</span>
        <span className="text-sm text-muted-foreground">
          {getLengthCategory(quote.length)} ({quote.length} chars)
        </span>
      </CardFooter>
    </Card>
  );
}
