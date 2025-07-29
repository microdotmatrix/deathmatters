import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { getEntryById, getUserObituary } from "@/lib/db/queries";
import { format } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ObituaryActions } from "./actions";

interface PageProps {
  params: Promise<{ entryId: string; id: string }>;
}

export default async function ObituaryViewPage({ params }: PageProps) {
  const { entryId, id } = await params;

  // Fetch both the deceased entry and the specific obituary
  const [entry, obituary] = await Promise.all([
    getEntryById(entryId),
    getUserObituary(id),
  ]);

  if (!entry || !obituary) {
    notFound();
  }

  // Verify the obituary belongs to this deceased person
  if (obituary.deceasedId !== entryId) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href={`/dashboard/${entryId}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Icon icon="mdi:arrow-left" className="w-4 h-4 mr-2" />
            Back to Entry
          </Link>
          <Link
            href={`/dashboard/${entryId}/obituaries`}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            View All Obituaries
          </Link>
        </div>

        {/* Obituary Content */}
        <div className="space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="mdi:file-document-outline" className="w-5 h-5" />
                Obituary for {obituary.fullName}
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                <p>
                  Created:{" "}
                  {format(
                    new Date(obituary.createdAt),
                    "MMMM d, yyyy 'at' h:mm a"
                  )}
                </p>
                <p>Birth Date: {obituary.birthDate}</p>
                <p>Death Date: {obituary.deathDate}</p>
              </div>
            </CardHeader>
          </Card>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Generated Content - Left Column (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Claude Version */}
              {obituary.generatedTextClaude && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Icon icon="mdi:robot" className="w-5 h-5" />
                      Claude Version
                      <span className="text-sm font-normal text-muted-foreground">
                        ({obituary.generatedTextClaudeTokens} tokens)
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                      {obituary.generatedTextClaude}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* OpenAI Version */}
              {obituary.generatedTextOpenAI && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Icon icon="mdi:brain" className="w-5 h-5" />
                      OpenAI Version
                      <span className="text-sm font-normal text-muted-foreground">
                        ({obituary.generatedTextOpenAITokens} tokens)
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                      {obituary.generatedTextOpenAI}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column (1/3) - Input Data and Actions */}
            <div className="space-y-6">
              {/* Input Data */}
              {obituary.inputData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Icon icon="mdi:form-textbox" className="w-5 h-5" />
                      Form Input Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      {Object.entries(
                        obituary.inputData as Record<string, any>
                      ).map(([key, value]) => {
                        if (
                          !value ||
                          (Array.isArray(value) && value.length === 0)
                        )
                          return null;

                        return (
                          <div
                            key={key}
                            className="border-b pb-2 last:border-b-0"
                          >
                            <div className="font-medium capitalize mb-1">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </div>
                            <div className="text-muted-foreground">
                              {Array.isArray(value) ? (
                                <ul className="list-disc list-inside space-y-1">
                                  {value.map((item, index) => (
                                    <li key={index}>
                                      {typeof item === "object"
                                        ? JSON.stringify(item)
                                        : String(item)}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                String(value)
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <Card>
                <CardContent className="pt-6">
                  <ObituaryActions entryId={entryId} obituary={obituary} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
