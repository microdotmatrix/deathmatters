"use client";

import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import Link from "next/link";

// Client component for interactive actions
export const ObituaryActions = ({
  entryId,
  obituary,
}: {
  entryId: string;
  obituary: any;
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const text =
      obituary.generatedText ||
      obituary.generatedTextClaude ||
      obituary.generatedTextOpenAI;
    if (text) {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href={`/dashboard/${entryId}/obituaries/new`}
        className={buttonVariants({ variant: "default" })}
      >
        <Icon icon="mdi:plus" className="w-4 h-4 mr-2" />
        Generate New Obituary
      </Link>
      <button
        onClick={handlePrint}
        className={buttonVariants({ variant: "outline" })}
      >
        <Icon icon="mdi:printer" className="w-4 h-4 mr-2" />
        Print
      </button>
      <button
        onClick={handleCopy}
        className={buttonVariants({ variant: "outline" })}
      >
        <Icon icon="mdi:content-copy" className="w-4 h-4 mr-2" />
        Copy Text
      </button>
    </div>
  );
};
