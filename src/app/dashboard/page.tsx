import { ActionButton } from "@/components/elements/action-button";
import { CreatePortal } from "@/components/sections/dashboard/create";
import { CreateForm } from "@/components/sections/dashboard/form";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { deleteDeceased } from "@/lib/actions/user";
import {
  getCreatorEntries,
  getGeneratedImagesByDeceasedId,
  getObituariesByDeceasedId,
  getUserUploads,
} from "@/lib/db/queries";
import type { Deceased } from "@/lib/db/schema";
import { differenceInYears, format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

export default function PortalPage() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <Suspense fallback="Loading...">
          <PortalPageContent />
        </Suspense>
      </div>
    </main>
  );
}

const PortalPageContent = async () => {
  const entries = await getCreatorEntries();
  const uploads = await getUserUploads();
  const hasEntries = entries.length > 0;
  const [featuredEntry, ...remainingEntries] = entries;

  // Fetch stats for the featured entry if it exists
  let featuredEntryStats = null;
  if (featuredEntry) {
    const [obituaries, generatedImages] = await Promise.all([
      getObituariesByDeceasedId(featuredEntry.id),
      getGeneratedImagesByDeceasedId(featuredEntry.id),
    ]);
    featuredEntryStats = {
      obituariesCount: obituaries.length,
      imagesCount: generatedImages.length,
    };
  }

  if (!hasEntries) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Your Portal</h1>
          <p className="max-w-lg mx-auto text-muted-foreground mb-8">
            To use Death Matter Tools, start by creating a profile for the
            person you will be creating content for. Once you create an entry,
            you can apply our tools to create obituaries, memorial images, and
            more. Create your first entry to get started.
          </p>
        </div>
        <div className="w-full max-w-md">
          <CreateForm />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <CreatePortal />
      </div>

      {/* Featured Entry - Large Section */}
      <section className="min-h-[50vh]">
        <FeaturedEntryCard entry={featuredEntry} stats={featuredEntryStats} />
      </section>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Previous Entries (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-semibold">Previous Entries</h2>
          {remainingEntries.length > 0 ? (
            <div className="space-y-4">
              {remainingEntries.map((entry) => (
                <PreviousEntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No previous entries yet.</p>
          )}
        </div>

        {/* Right Column - User Stats (1/3 width) */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Statistics</h2>
          <UserStats entries={entries} uploads={uploads} />
        </div>
      </div>
    </div>
  );
};

const FeaturedEntryCard = ({
  entry,
  stats,
}: {
  entry: Deceased;
  stats: { obituariesCount: number; imagesCount: number } | null;
}) => {
  return (
    <Card className="border-0 shadow-none">
      <div className="grid md:grid-cols-2 min-h-[50vh]">
        {/* Image Section - Left Half */}
        <figure className="relative shadow-xl dark:shadow-foreground/5 transition-shadow duration-200 rounded-lg overflow-clip aspect-auto 3xl:aspect-[4/3]">
          <Image
            src={entry.image}
            alt={entry.name}
            height={1280}
            width={1280}
            className="size-full object-cover"
            priority
          />
        </figure>

        {/* Content Section - Right Half */}
        <div className="p-8 flex flex-col justify-center space-y-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Most Recent
            </p>
            <h2 className="text-4xl font-bold mb-4">{entry.name}</h2>
            {entry.birthLocation && (
              <p className="text-lg text-muted-foreground mb-6">
                {entry.birthLocation}
              </p>
            )}
          </div>

          <div className="space-y-1 h-full">
            <div className="flex items-center gap-4">
              <span className="font-medium">Born:</span>
              <span>{format(new Date(entry.birthDate), "MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium">Died:</span>
              <span>{format(new Date(entry.deathDate), "MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium">Age:</span>
              <span>
                {differenceInYears(
                  new Date(entry.deathDate),
                  new Date(entry.birthDate)
                )}{" "}
                years
              </span>
            </div>

            {/* Generated Content Stats */}
            {stats && (
              <>
                <div className="h-px bg-border my-4" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                    Generated Content
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">Obituaries:</span>
                    <span className="flex items-center gap-1">
                      <Icon
                        icon="mdi:file-document-outline"
                        className="w-4 h-4"
                      />
                      {stats.obituariesCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">Memorial Images:</span>
                    <span className="flex items-center gap-1">
                      <Icon
                        icon="mdi:image-multiple-outline"
                        className="w-4 h-4"
                      />
                      {stats.imagesCount}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex-shrink-0 flex flex-col gap-2 pr-4">
            <ActionButtons deleteDeceased={deleteDeceased} entry={entry} />
          </div>
        </div>
      </div>
    </Card>
  );
};

const PreviousEntryCard = ({ entry }: { entry: Deceased }) => {
  return (
    <Card className="hover:shadow-xl dark:shadow-foreground/5 transition-shadow duration-200 p-0">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Small thumbnail on the left */}
          <div className="relative w-full md:size-40 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={entry.image}
              alt={entry.name}
              width={420}
              height={420}
              className="size-full object-cover"
            />
          </div>

          {/* Name and dates in the middle */}
          <div className="flex-grow min-w-0 w-full pl-4 md:pl-0">
            <h3 className="font-semibold text-lg truncate">{entry.name}</h3>
            {entry.birthLocation && (
              <p className="text-sm text-muted-foreground truncate">
                {entry.birthLocation}
              </p>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <span>{format(new Date(entry.birthDate), "MMM d, yyyy")}</span>
              <span>-</span>
              <span>{format(new Date(entry.deathDate), "MMM d, yyyy")}</span>
            </div>
            <div className="mt-4 pb-4 md:pb-0">
              <ActionButtons deleteDeceased={deleteDeceased} entry={entry} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const UserStats = ({
  entries,
  uploads,
}: {
  entries: Deceased[];
  uploads: any[];
}) => {
  const totalEntries = entries.length;
  const totalUploads = uploads.length;

  // Calculate average age at death
  const averageAge =
    entries.length > 0
      ? Math.round(
          entries.reduce((sum, entry) => {
            const age = differenceInYears(
              new Date(entry.deathDate),
              new Date(entry.birthDate)
            );
            return sum + age;
          }, 0) / entries.length
        )
      : 0;

  // Get most recent entry date
  const mostRecentEntry =
    entries.length > 0
      ? format(new Date(entries[0].createdAt), "MMM d, yyyy")
      : "None";

  // Calculate entries this month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const entriesThisMonth = entries.filter((entry) => {
    const entryDate = new Date(entry.createdAt);
    return (
      entryDate.getMonth() === currentMonth &&
      entryDate.getFullYear() === currentYear
    );
  }).length;

  const stats = [
    {
      label: "Total Entries",
      value: totalEntries,
      icon: "mdi:account-multiple",
      color: "text-blue-600",
    },
    {
      label: "This Month",
      value: entriesThisMonth,
      icon: "mdi:calendar-month",
      color: "text-green-600",
    },
    {
      label: "Total Uploads",
      value: totalUploads,
      icon: "mdi:cloud-upload",
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-4">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gray-100 ${stat.color}`}>
                <Icon icon={stat.icon} className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-lg font-semibold">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const ActionButtons = ({
  deleteDeceased,
  entry,
}: {
  deleteDeceased: (id: string) => void;
  entry: Deceased;
}) => {
  const deleteAction = deleteDeceased.bind(null, entry.id);
  return (
    <div className="flex gap-2">
      <Link
        href={`/dashboard/${entry.id}`}
        className={buttonVariants({
          variant: "outline",
          size: "sm",
          className: "flex items-center gap-2",
        })}
      >
        <Icon icon="mdi:pencil-outline" className="size-4" /> Edit
      </Link>
      <Link
        href={`/dashboard/${entry.id}/obituaries/new`}
        className={buttonVariants({
          variant: "outline",
          size: "sm",
          className: "flex items-center gap-2",
        })}
      >
        <Icon icon="mdi:plus" className="size-4" /> New Obituary
      </Link>
      <Link
        href={`/dashboard/${entry.id}/images/new`}
        className={buttonVariants({
          variant: "outline",
          size: "sm",
          className: "flex items-center gap-2",
        })}
      >
        <Icon icon="mdi:image-outline" className="size-4" /> New Memorial Image
      </Link>
      <ActionButton
        variant="destructive"
        size="sm"
        className="flex items-center gap-2"
        action={deleteAction}
        requireAreYouSure
      >
        <Icon icon="mdi:delete-outline" className="size-4" /> Delete
      </ActionButton>
    </div>
  );
};
