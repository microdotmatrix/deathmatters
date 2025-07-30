"use client";

import { AnimatedInput } from "@/components/elements/form/animated-input";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { PlacidRequest } from "@/lib/api/placid";
import type { Deceased } from "@/lib/db/schema";
import type { UnifiedQuote } from "@/types/quotes";
import type { ActionState } from "@/types/state";
import { format, parseISO } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export function CreateImage({
  action,
  userId,
  deceased,
  quotes,
  entryId,
}: {
  action: (formData: PlacidRequest, userId: string) => Promise<ActionState>;
  userId: string;
  deceased: Deceased;
  quotes: UnifiedQuote[];
  entryId: string;
}) {
  const [openQuotes, setOpenQuotes] = useState(false);
  const [formData, setFormData] = useState<PlacidRequest>({
    name: deceased.name,
    epitaph: "",
    citation: "",
    birth: format(parseISO(deceased.birthDate), "MMMM d, yyyy"),
    death: format(parseISO(deceased.deathDate), "MMMM d, yyyy"),
    portrait: deceased.image,
  });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      if (!formData.epitaph.trim()) {
        toast("Please enter an epitaph");
        return;
      }
      const result = await action(formData, userId);
      if (result.error) {
        setError(result.error);
        return;
      }
      startTransition(() => {
        router.push(`/dashboard/${deceased.id}/images/new?id=${result.result}`);
      });
    });
  };

  return (
    <div className="w-full max-w-lg p-6 mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Display deceased information */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {deceased.name}
            </h2>
            <p className="text-gray-600">
              {format(parseISO(deceased.birthDate), "MMMM d, yyyy")} -{" "}
              {format(parseISO(deceased.deathDate), "MMMM d, yyyy")}
            </p>
          </div>

          {/* Display the deceased's image */}
          <div className="flex justify-center">
            <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-gray-200">
              <Image
                src={deceased.image}
                alt={deceased.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 192px"
              />
            </div>
          </div>
        </div>

        <div className="relative">
          <AnimatedInput
            name="epitaph"
            label="Epitaph"
            type="textarea"
            defaultValue={formData.epitaph}
            onChange={handleChange}
            placeholder="Is there a quote or phrase you'd like to remember them by?"
          />
          {quotes && quotes.length > 0 && (
            <Dialog open={openQuotes} onOpenChange={setOpenQuotes}>
              <div className="absolute right-2 bottom-2 z-10 flex items-center gap-2">
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    title="Choose from saved quotes"
                  >
                    <Icon icon="carbon:quotes" className="size-3" />
                  </Button>
                </DialogTrigger>
                <Button
                  variant="outline"
                  size="icon"
                  title="Reset quote"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      epitaph: "",
                      citation: "",
                    }))
                  }
                >
                  <Icon icon="carbon:reset" className="size-3" />
                </Button>
              </div>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-base flex items-center gap-2">
                    <Icon icon="mdi:bookmark-outline" className="size-6" />
                    Select a quote
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Choose a quote to add to your epitaph
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {quotes.map((quote, index) => (
                      <div
                        key={index}
                        className="p-4 space-y-4 border rounded-md cursor-pointer hover:bg-card/75 shadow-lg hover:shadow-teal-500/10 transition-colors"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            epitaph: quote.quote,
                            citation: quote.author,
                          }));
                          setOpenQuotes(false);
                          toast("Quote selected");
                        }}
                      >
                        <p className="text-sm italic">"{quote.quote}"</p>
                        <p className="text-sm font-medium">{quote.author}</p>
                      </div>
                    ))}
                    {quotes.length === 0 && (
                      <div className="text-center py-8">
                        <Icon
                          icon="carbon:quotes"
                          className="size-12 mb-4 text-muted-foreground mx-auto"
                        />
                        <p className="text-muted-foreground">
                          No saved quotes found
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <DialogFooter>
                  <Link
                    href="/quotes"
                    className={buttonVariants({ variant: "default" })}
                  >
                    Search Quotes
                  </Link>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <AnimatedInput
          name="citation"
          label="Citation"
          defaultValue={formData.citation}
          onChange={handleChange}
          placeholder="Who said it?"
        />

        {/* Hidden inputs for the form data that's auto-populated */}
        <input type="hidden" name="name" value={formData.name} />
        <input type="hidden" name="birth" value={formData.birth} />
        <input type="hidden" name="death" value={formData.death} />
        <input type="hidden" name="portrait" value={formData.portrait} />

        <div className="flex flex-col items-center gap-2 sm:flex-row">
          <Button
            type="submit"
            className="flex-1 w-full sm:w-auto"
            disabled={isPending}
          >
            Generate Image
          </Button>
          <Button
            type="reset"
            variant="outline"
            className="flex-1 w-full sm:w-auto"
            onClick={() => {
              setFormData({
                name: deceased.name,
                epitaph: "",
                citation: "",
                birth: format(parseISO(deceased.birthDate), "MMMM d, yyyy"),
                death: format(parseISO(deceased.deathDate), "MMMM d, yyyy"),
                portrait: deceased.image,
              });
              setError(null);
              router.replace(`/dashboard/${deceased.id}/images/new`);
            }}
          >
            Reset
          </Button>
        </div>
        {error && <p className="text-destructive">{error}</p>}
        {/* Back to Entry Button */}
        <div className="mt-2">
          <Link
            href={`/dashboard/${entryId}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Icon icon="mdi:arrow-left" className="w-4 h-4 mr-2" />
            Back to Entry
          </Link>
        </div>
      </form>
    </div>
  );
}
