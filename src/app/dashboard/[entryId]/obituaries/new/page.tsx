import { ObituaryGeneratorForm } from "@/components/obituaries/form";
import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { getEntryById, getUserObituariesDraft } from "@/lib/db/queries";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{ entryId: string }>;
}

export default async function ObituaryNewPage({ params }: PageProps) {
  const { entryId } = await params;
  const entry = await getEntryById(entryId);

  const obituariesDraft = await getUserObituariesDraft();

  if (!entry) {
    notFound();
  }

  return (
    <main className="flex flex-col justify-center px-2 lg:px-4 py-8">
      {/* Back to Entry Button */}
      <div className="mb-2">
        <Link
          href={`/dashboard/${entryId}`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <Icon icon="mdi:arrow-left" className="w-4 h-4 mr-2" />
          Back to Entry
        </Link>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ObituaryGeneratorForm
          entry={entry}
          obituariesDraft={obituariesDraft}
        />
      </Suspense>
    </main>
  );
}
