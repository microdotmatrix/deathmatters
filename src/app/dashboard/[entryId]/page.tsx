import { SavedQuotes } from "@/components/quotes/saved";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateDeceased } from "@/lib/actions/user";
import { getEntryById } from "@/lib/db/queries";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{ entryId: string }>;
}

export default async function EntryEditPage({ params }: PageProps) {
  const { entryId } = await params;
  const entry = await getEntryById(entryId);

  if (!entry) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <Suspense fallback="Loading...">
          <EntryEditContent entry={entry} />
        </Suspense>
      </div>
    </main>
  );
}

const EntryEditContent = ({ entry }: { entry: any }) => {
  const handleSubmit = async (formData: FormData) => {
    "use server";
    const result = await updateDeceased({}, formData);
    if (result?.success) {
      redirect("/dashboard");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <Icon icon="mdi:arrow-left" className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Edit Form - Takes up 2/3 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Entry Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={handleSubmit} className="space-y-6">
                <input type="hidden" name="id" value={entry.id} />

                {/* Current Image Display */}
                <div className="space-y-2">
                  <Label>Current Image</Label>
                  <div className="relative w-full h-80 md:h-96 xl:h-[42rem] rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={entry.image}
                      alt={entry.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Image URL Input */}
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    name="image"
                    type="url"
                    defaultValue={entry.image}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={entry.name}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                {/* Birth Location */}
                <div className="space-y-2">
                  <Label htmlFor="birthLocation">Birth Location</Label>
                  <Input
                    id="birthLocation"
                    name="birthLocation"
                    defaultValue={entry.birthLocation || ""}
                    placeholder="City, State/Country"
                    required
                  />
                </div>

                {/* Dates */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Birth Date</Label>
                    <Input
                      id="birthDate"
                      name="birthDate"
                      type="date"
                      defaultValue={entry.birthDate}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deathDate">Death Date</Label>
                    <Input
                      id="deathDate"
                      name="deathDate"
                      type="date"
                      defaultValue={entry.deathDate}
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1">
                    <Icon icon="mdi:content-save" className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Link
                    href="/dashboard"
                    className={buttonVariants({ variant: "outline" })}
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Generated Content Sections - Takes up 1/3 */}
        <div className="space-y-6">
          {/* Generated Obituaries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="mdi:file-document-outline" className="w-5 h-5" />
                Obituaries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  No obituaries generated yet.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <Icon icon="mdi:plus" className="w-4 h-4 mr-2" />
                  Generate Obituary
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Memorial Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="mdi:image-multiple-outline" className="w-5 h-5" />
                Memorial Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  No memorial images created yet.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <Icon icon="mdi:plus" className="w-4 h-4 mr-2" />
                  Create Memorial Image
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Saved Quotes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="mdi:format-quote-close" className="w-5 h-5" />
                Saved Quotes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[300px]">
                <Suspense fallback={<SavedQuotesSkeleton />}>
                  <SavedQuotes />
                </Suspense>
              </div>
            </CardContent>
          </Card>

          {/* Entry Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="mdi:information-outline" className="w-5 h-5" />
                Entry Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Created:</span>
                  <br />
                  <span className="text-muted-foreground">
                    {format(
                      new Date(entry.createdAt),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>
                  <br />
                  <span className="text-muted-foreground">
                    {format(
                      new Date(entry.updatedAt),
                      "MMM d, yyyy 'at' h:mm a"
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

function SavedQuotesSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-12 w-12 rounded-full bg-muted animate-pulse mb-4"></div>
      <div className="h-4 w-48 bg-muted animate-pulse mb-2"></div>
      <div className="h-4 w-32 bg-muted animate-pulse mb-4"></div>
      <div className="h-8 w-28 bg-muted animate-pulse rounded-md"></div>
    </div>
  );
}
