"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icon";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, FormEvent, useState, useTransition } from "react";
import { AnimatedInput } from "../elements/form/animated-input";

interface QuoteSearchFormProps {
  initialKeywords?: string;
  initialAuthor?: string;
  initialLengths?: string[];
}

export function QuoteSearchForm({
  initialKeywords = "",
  initialAuthor = "",
  initialLengths = [],
}: QuoteSearchFormProps) {
  const router = useRouter();
  const [keywords, setKeywords] = useState(initialKeywords);
  const [author, setAuthor] = useState(initialAuthor);
  const [lengths, setLengths] = useState<string[]>(initialLengths || []);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();

  // Handle form submission
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Build the search parameters
    const params = new URLSearchParams(searchParams);

    if (keywords && keywords.trim() !== "") {
      params.set("keywords", keywords.trim());
    }

    if (author && author.trim() !== "") {
      params.set("author", author.trim());
    }

    if (lengths && lengths.length > 0) {
      params.set("lengths", lengths.join(","));
    }

    startTransition(() => {
      router.replace(`/quotes/search?${params.toString()}`);
    });
  }

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    e.preventDefault();
    const { name, value } = e.target;
    if (name === "keywords") {
      setKeywords(value);
    } else if (name === "author") {
      setAuthor(value);
    }
  };

  // Handle checkbox changes
  function handleCheckboxChange(value: string, checked: boolean) {
    if (checked) {
      setLengths((prev) => [...prev, value]);
    } else {
      setLengths((prev) => prev.filter((item) => item !== value));
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-end">
          <Icon icon="carbon:search" className="size-8" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <AnimatedInput
              name="keywords"
              label="Keywords"
              placeholder="Search for quotes containing keywords (eg. love, wisdom, etc.)"
              value={keywords}
              onChange={handleChange}
              type="text"
            />
          </div>

          <div className="space-y-2">
            <AnimatedInput
              name="author"
              label="Author"
              placeholder="Search for quotes by a specific author"
              value={author}
              onChange={handleChange}
              type="text"
            />
          </div>

          <div className="space-y-4">
            <div>
              <Label>Quote Length</Label>
              <p className="text-sm text-muted-foreground">
                Filter quotes by their length
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="flex items-start space-x-3 space-y-0">
                <Checkbox
                  id="short"
                  name="lengths"
                  value="short"
                  checked={lengths.includes("short")}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("short", checked as boolean)
                  }
                />
                <Label htmlFor="short" className="font-normal">
                  Short (1-75 characters)
                </Label>
              </div>
              <div className="flex items-start space-x-3 space-y-0">
                <Checkbox
                  id="medium"
                  name="lengths"
                  value="medium"
                  checked={lengths.includes("medium")}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("medium", checked as boolean)
                  }
                />
                <Label htmlFor="medium" className="font-normal">
                  Medium (76-150 characters)
                </Label>
              </div>
              <div className="flex items-start space-x-3 space-y-0">
                <Checkbox
                  id="long"
                  name="lengths"
                  value="long"
                  checked={lengths.includes("long")}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("long", checked as boolean)
                  }
                />
                <Label htmlFor="long" className="font-normal">
                  Long (150+ characters)
                </Label>
              </div>
            </div>
          </div>

          <footer className="flex flex-col sm:flex-row md:flex-col 2xl:flex-row gap-2">
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? (
                <>
                  <Icon icon="mdi:loading" className="animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                "Search Quotes"
              )}
            </Button>
            <Button
              type="reset"
              variant="secondary"
              className="flex-1"
              disabled={isPending}
              onClick={() => {
                setKeywords("");
                setAuthor("");
                setLengths([]);
                startTransition(() => {
                  router.replace("/quotes/search");
                });
              }}
            >
              Reset
            </Button>
          </footer>
        </form>
      </CardContent>
    </Card>
  );
}

export function QuoteSearchSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Search for Quotes
        </CardTitle>
        <CardContent>
          <p className="animate-pulse">Loading...</p>
        </CardContent>
      </CardHeader>
    </Card>
  );
}
