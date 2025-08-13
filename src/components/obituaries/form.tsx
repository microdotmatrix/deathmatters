"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useScrollIntoView } from "@/hooks/use-scroll-into-view";
import { generateObituaries, saveObituaryFormDraft } from "@/lib/actions/ai";
import { ObituaryDraft } from "@/lib/db/schema";
import { readStreamableValue } from "ai/rsc";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { AnimatedDatePicker } from "../elements/form/animated-date";
import { AnimatedInput } from "../elements/form/animated-input";
import { Typewriter } from "../elements/typewriter";
import { Icon } from "../ui/icon";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  location?: string;
}

interface ServiceDetails {
  type: string;
  date?: Date;
  time?: string;
  location?: string;
  address?: string;
  officiant?: string;
}

export function ObituaryGeneratorForm({
  entry,
  obituariesDraft,
}: {
  entry: any;
  obituariesDraft: ObituaryDraft[];
}) {
  const [generatedObituaryOpenAI, setGeneratedObituaryOpenAI] = useState<
    string | undefined
  >(undefined);
  const [generatedObituaryClaude, setGeneratedObituaryClaude] = useState<
    string | undefined
  >(undefined);
  const [completed, setCompleted] = useState(false);
  const [selectSavedObituary, setSelectSavedObituary] = useState<string | null>(
    null
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [containerRef, endRef] = useScrollIntoView();

  // Form state for controlled inputs
  const [formData, setFormData] = useState({
    fullName: entry.name,
    birthDate: entry.birthDate,
    deathDate: entry.deathDate,
    biographySummary: "",
    accomplishments: "",
    hobbiesInterests: "",
    survivedBy: [] as FamilyMember[],
    predeceasedBy: [] as FamilyMember[],
    serviceDetails: "",
    tone: "",
  });

  const addFamilyMember = (type: "survivedBy" | "predeceasedBy") => {
    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: "",
      relationship: "",
    };

    setFormData((prev) => ({
      ...prev,
      [type]: [...prev[type], newMember],
    }));
  };

  const updateFamilyMember = (
    type: "survivedBy" | "predeceasedBy",
    id: string,
    field: keyof FamilyMember,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].map((member) =>
        member.id === id ? { ...member, [field]: value } : member
      ),
    }));
  };

  const removeFamilyMember = (
    type: "survivedBy" | "predeceasedBy",
    id: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((member) => member.id !== id),
    }));
  };

  // Handle input changes
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Auto-select draft based on URL searchParams
  useEffect(() => {
    const draftIdFromUrl = searchParams.get("draftId");
    if (draftIdFromUrl && obituariesDraft.length > 0) {
      const draftExists = obituariesDraft.find(
        (draft) => draft.id === draftIdFromUrl
      );
      if (draftExists && selectSavedObituary !== draftIdFromUrl) {
        // Directly populate form without calling handleDraftSelection to avoid URL update loop
        const selectedDraft = draftExists;
        if (selectedDraft?.inputData) {
          const inputData = selectedDraft.inputData;

          // Convert family members from string format to FamilyMember array if needed
          const parseSurvivedBy = (): FamilyMember[] => {
            if (
              inputData.survivedBy &&
              typeof inputData.survivedBy === "string"
            ) {
              try {
                const parsed = JSON.parse(inputData.survivedBy);
                return Array.isArray(parsed) ? parsed : [];
              } catch {
                return [];
              }
            }
            return (
              inputData.familyMembers?.filter((member) =>
                member.relationship.toLowerCase().includes("survivedBy")
              ) || []
            );
          };

          const parsePredeceasedBy = (): FamilyMember[] => {
            if (
              inputData.predeceasedBy &&
              typeof inputData.predeceasedBy === "string"
            ) {
              try {
                const parsed = JSON.parse(inputData.predeceasedBy);
                return Array.isArray(parsed) ? parsed : [];
              } catch {
                return [];
              }
            }
            return (
              inputData.familyMembers?.filter((member) =>
                member.relationship.toLowerCase().includes("predeceasedBy")
              ) || []
            );
          };

          setFormData({
            fullName: inputData.fullName || "",
            birthDate: inputData.birthDate
              ? new Date(inputData.birthDate)
              : undefined,
            deathDate: inputData.deathDate
              ? new Date(inputData.deathDate)
              : undefined,
            biographySummary: inputData.biographySummary || "",
            accomplishments:
              inputData.accomplishments || inputData.achievements || "",
            hobbiesInterests:
              inputData.hobbiesInterests || inputData.hobbies || "",
            survivedBy: parseSurvivedBy(),
            predeceasedBy: parsePredeceasedBy(),
            serviceDetails: inputData.serviceDetails || "",
            tone: inputData.tone || "",
          });
          setSelectSavedObituary(draftIdFromUrl);
          toast.success(`Loaded draft for ${inputData.fullName}`);
        }
      }
    } else if (!draftIdFromUrl && selectSavedObituary) {
      // Clear selection if no draftId in URL
      setSelectSavedObituary(null);
    }
    return () => {
      setSelectSavedObituary(null);
    };
  }, [searchParams, obituariesDraft]);

  const resetForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormData({
      fullName: "",
      birthDate: undefined,
      deathDate: undefined,
      biographySummary: "",
      accomplishments: "",
      hobbiesInterests: "",
      survivedBy: [],
      predeceasedBy: [],
      serviceDetails: "",
      tone: "",
    });
    setSelectSavedObituary(null);
    // Clear URL searchParams when resetting
    router.replace("/obituaries");
  };

  // Function to populate form with selected draft data
  const handleDraftSelection = (draftId: string) => {
    const selectedDraft = obituariesDraft.find((draft) => draft.id === draftId);
    if (selectedDraft?.inputData) {
      const inputData = selectedDraft.inputData;

      // Convert family members from string format to FamilyMember array if needed
      const parseSurvivedBy = (): FamilyMember[] => {
        if (inputData.survivedBy && typeof inputData.survivedBy === "string") {
          try {
            const parsed = JSON.parse(inputData.survivedBy);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }
        return (
          inputData.familyMembers?.filter((member) =>
            member.relationship.toLowerCase().includes("survivedBy")
          ) || []
        );
      };

      const parsePredeceasedBy = (): FamilyMember[] => {
        if (
          inputData.predeceasedBy &&
          typeof inputData.predeceasedBy === "string"
        ) {
          try {
            const parsed = JSON.parse(inputData.predeceasedBy);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        }
        return (
          inputData.familyMembers?.filter((member) =>
            member.relationship.toLowerCase().includes("predeceasedBy")
          ) || []
        );
      };
      startTransition(() => {
        setFormData({
          fullName: inputData.fullName || "",
          birthDate: inputData.birthDate
            ? new Date(inputData.birthDate)
            : undefined,
          deathDate: inputData.deathDate
            ? new Date(inputData.deathDate)
            : undefined,
          biographySummary: inputData.biographySummary || "",
          accomplishments:
            inputData.accomplishments || inputData.achievements || "",
          hobbiesInterests:
            inputData.hobbiesInterests || inputData.hobbies || "",
          survivedBy: parseSurvivedBy(),
          predeceasedBy: parsePredeceasedBy(),
          serviceDetails: inputData.serviceDetails || "",
          tone: inputData.tone || "",
        });
        setSelectSavedObituary(draftId);
        toast.success(`Loaded draft for ${inputData.fullName}`);
        router.replace(`/obituaries?draftId=${draftId}`);
      });
    }
  };

  // This is the client-side function that calls the server action
  const handleFormSubmit = async () => {
    setGeneratedObituaryOpenAI(undefined); // Clear previous result
    setGeneratedObituaryClaude(undefined); // Clear previous result

    // Convert form state to FormData for server action
    const formDataObj = new FormData();
    // Add the deceased ID from the entry
    formDataObj.append("deceasedId", entry.id);
    Object.entries(formData).forEach(([key, value]) => {
      formDataObj.append(key, JSON.stringify(value));
    });

    startTransition(async () => {
      const { obituary, error } = await generateObituaries(formDataObj);
      if (error) {
        toast.error(error);
        console.error("Error generating obituary:", error);
        return;
      }
      startTransition(async () => {
        if (obituary) {
          try {
            let textClaude = "";
            let textOpenAI = "";
            for await (const delta of readStreamableValue(obituary?.claude!)) {
              textClaude += delta;
              setGeneratedObituaryClaude(textClaude);
            }
            for await (const delta of readStreamableValue(obituary?.openai!)) {
              textOpenAI += delta;
              setGeneratedObituaryOpenAI(textOpenAI);
            }
            toast.success("Obituary generated successfully!");
            setCompleted(true);
          } catch (error) {
            console.error("Error generating obituary:", error);
            toast.error("Failed to generate obituary");
          } finally {
            setCompleted(true);
          }
        }
      });
    });
  };

  const handleSaveDraft = async (formDataParam: FormData) => {
    startTransition(async () => {
      try {
        // Add the selected draft ID to the form data if we're updating an existing draft
        if (selectSavedObituary) {
          formDataParam.append("draftId", selectSavedObituary);
        }

        // Add survivedBy and predeceasedBy data to FormData as JSON strings
        formDataParam.append("survivedBy", JSON.stringify(formData.survivedBy));
        formDataParam.append(
          "predeceasedBy",
          JSON.stringify(formData.predeceasedBy)
        );

        const result = await saveObituaryFormDraft(formDataParam);

        if (result.success) {
          // If we created a new draft, update the selected draft ID
          if ("draftId" in result && result.draftId && !selectSavedObituary) {
            setSelectSavedObituary(result.draftId);
          }
          toast.success(
            selectSavedObituary
              ? "Obituary draft updated successfully!"
              : "Obituary draft saved successfully!"
          );
          router.replace(`/obituaries?draftId=${result.draftId}`);
        } else {
          toast.error(result.error || "Failed to save obituary draft");
        }
      } catch (error) {
        console.error("Error saving obituary draft:", error);
        toast.error("Failed to save obituary draft");
      }
    });
  };

  const toneOptions = [
    {
      value: "reverent",
      label: "Reverent",
      description: "Respectful and deeply honoring (default)",
    },
    { value: "somber", label: "Somber", description: "Serious and reflective" },
    {
      value: "uplifting",
      label: "Uplifting",
      description: "Positive and celebratory",
    },
    {
      value: "humorous",
      label: "Humorous",
      description: "Light-hearted with gentle humor",
    },
    {
      value: "formal",
      label: "Formal",
      description: "Traditional and dignified",
    },
    {
      value: "personal",
      label: "Personal",
      description: "Intimate and heartfelt",
    },
    {
      value: "inspiring",
      label: "Inspiring",
      description: "Motivational and encouraging",
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row items-stretch gap-4 relative">
      <section className="flex-2 lg:sticky lg:top-0 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Obituary Details</CardTitle>
          </CardHeader>
          <CardContent>
            {obituariesDraft.length > 0 && (
              <div className="flex items-center gap-4 border-b pb-2 mb-8">
                <div>
                  <span className="text-sm text-muted-foreground">
                    Saved Drafts:
                  </span>
                </div>
                <div>
                  <Select
                    value={searchParams.get("draftId") || ""}
                    onValueChange={handleDraftSelection}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an Obituary" />
                    </SelectTrigger>
                    <SelectContent>
                      {obituariesDraft.map((obituary: ObituaryDraft) => (
                        <SelectItem key={obituary.id} value={obituary.id}>
                          {obituary.inputData?.fullName || "Untitled Draft"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <form action={handleFormSubmit} className="grid grid-cols-1 gap-6">
              <div>
                <AnimatedInput
                  label="Full Name"
                  name="fullName"
                  defaultValue={entry.name}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <AnimatedDatePicker
                    date={formData.birthDate}
                    setDate={(date) =>
                      handleInputChange("birthDate", date?.toISOString() || "")
                    }
                    label="Date of Birth"
                  />
                </div>
                <div className="relative">
                  <AnimatedDatePicker
                    date={formData.deathDate}
                    setDate={(date) =>
                      handleInputChange("deathDate", date?.toISOString() || "")
                    }
                    label="Date of Death"
                  />
                </div>
              </div>

              <div>
                <AnimatedInput
                  label="Biographical Summary"
                  name="biographySummary"
                  type="textarea"
                  value={formData.biographySummary}
                  onChange={(e) =>
                    handleInputChange("biographySummary", e.target.value)
                  }
                  placeholder="E.g., early life, education, career, character traits..."
                  className="h-24"
                  required
                />
              </div>

              <div>
                <AnimatedInput
                  label="Accomplishments & Achievements (Optional)"
                  name="accomplishments"
                  type="textarea"
                  value={formData.accomplishments}
                  onChange={(e) =>
                    handleInputChange("accomplishments", e.target.value)
                  }
                  placeholder="E.g., awards, contributions, significant milestones..."
                  className="h-24"
                />
              </div>

              <div>
                <AnimatedInput
                  label="Hobbies & Interests (Optional)"
                  name="hobbiesInterests"
                  type="textarea"
                  value={formData.hobbiesInterests}
                  onChange={(e) =>
                    handleInputChange("hobbiesInterests", e.target.value)
                  }
                  placeholder="E.g., passions, favorite pastimes, unique quirks..."
                  className="h-24"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="survivedBy">Survived By</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addFamilyMember("survivedBy")}
                  >
                    <Icon icon="lucide:plus" className="h-4 w-4 mr-2" />
                    Add Family Member
                  </Button>
                </div>

                {formData.survivedBy.map((member: FamilyMember) => (
                  <div
                    key={member.id}
                    className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 border rounded-lg"
                  >
                    <Input
                      name="name"
                      placeholder="Name"
                      value={member.name}
                      onChange={(e) =>
                        updateFamilyMember(
                          "survivedBy",
                          member.id,
                          "name",
                          e.target.value
                        )
                      }
                    />
                    <Input
                      name="relationship"
                      placeholder="Relationship"
                      value={member.relationship}
                      onChange={(e) =>
                        updateFamilyMember(
                          "survivedBy",
                          member.id,
                          "relationship",
                          e.target.value
                        )
                      }
                    />
                    <Input
                      name="location"
                      placeholder="Location (optional)"
                      value={member.location || ""}
                      onChange={(e) =>
                        updateFamilyMember(
                          "survivedBy",
                          member.id,
                          "location",
                          e.target.value
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full lg:w-fit"
                      onClick={() =>
                        removeFamilyMember("survivedBy", member.id)
                      }
                    >
                      <Icon icon="lucide:trash" className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="predeceasedBy">Preceded in Death By</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addFamilyMember("predeceasedBy")}
                  >
                    <Icon icon="lucide:plus" className="h-4 w-4 mr-2" />
                    Add Family Member
                  </Button>
                </div>

                {formData.predeceasedBy.map((member: FamilyMember) => (
                  <div
                    key={member.id}
                    className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 border rounded-lg"
                  >
                    <Input
                      name="name"
                      placeholder="Name"
                      value={member.name}
                      onChange={(e) =>
                        updateFamilyMember(
                          "predeceasedBy",
                          member.id,
                          "name",
                          e.target.value
                        )
                      }
                    />
                    <Input
                      name="relationship"
                      placeholder="Relationship"
                      value={member.relationship}
                      onChange={(e) =>
                        updateFamilyMember(
                          "predeceasedBy",
                          member.id,
                          "relationship",
                          e.target.value
                        )
                      }
                    />
                    <Input
                      name="location"
                      placeholder="Location (optional)"
                      value={member.location || ""}
                      onChange={(e) =>
                        updateFamilyMember(
                          "predeceasedBy",
                          member.id,
                          "location",
                          e.target.value
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full lg:w-fit"
                      onClick={() =>
                        removeFamilyMember("predeceasedBy", member.id)
                      }
                    >
                      <Icon icon="lucide:trash" className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div>
                <AnimatedInput
                  name="serviceDetails"
                  label="Funeral/Memorial Service Details (Optional)"
                  type="textarea"
                  value={formData.serviceDetails}
                  onChange={(e) =>
                    handleInputChange("serviceDetails", e.target.value)
                  }
                  placeholder="E.g., date, time, location of visitation, service, burial..."
                  className="h-24"
                />
              </div>

              <div>
                <Label htmlFor="tone">Desired Tone</Label>
                <RadioGroup
                  defaultValue="reverant"
                  onValueChange={(value) => handleInputChange("tone", value)}
                  className="flex flex-row gap-4 mt-4"
                >
                  <section className="space-y-3 flex-1 [&>div]:gap-4 [&>div_label]:mt-0.75">
                    {toneOptions.map((option) => (
                      <div className="flex items-center" key={option.value}>
                        <RadioGroupItem
                          value={option.value}
                          id={option.value}
                        />
                        <Label
                          htmlFor={option.value}
                          className="items-baseline"
                        >
                          {option.label}
                          <span className="text-xs font-normal text-muted-foreground">
                            {option.description}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </section>
                </RadioGroup>
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Generating..." : "Generate Obituary"}
                </Button>
                {/* <Button variant="secondary" formAction={handleSaveDraft}>
                  Save Draft
                </Button> */}
                <Button type="reset" variant="outline" onClick={resetForm}>
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="flex-3 flex flex-col gap-4 px-4" ref={containerRef}>
        {completed && <div ref={endRef} />}
        {!completed && isPending ? (
          <Typewriter
            text={`> Generating an obituary for ${formData.fullName}...`}
            repeat={false}
            className="mt-8"
          />
        ) : (
          <Typewriter
            text={
              completed
                ? "> Obituary generated successfully!"
                : "> Complete the form to generate an obituary..."
            }
            repeat={false}
            className="mt-8"
          />
        )}
        {(generatedObituaryOpenAI || generatedObituaryClaude) && (
          <ObituaryOutput
            generatedObituaryOpenAI={generatedObituaryOpenAI}
            generatedObituaryClaude={generatedObituaryClaude}
            setGeneratedObituaryOpenAI={setGeneratedObituaryOpenAI}
            setGeneratedObituaryClaude={setGeneratedObituaryClaude}
          />
        )}
      </section>
    </div>
  );
}

function ObituaryOutput({
  generatedObituaryOpenAI,
  generatedObituaryClaude,
  setGeneratedObituaryOpenAI,
  setGeneratedObituaryClaude,
}: {
  generatedObituaryOpenAI?: string;
  generatedObituaryClaude?: string;
  setGeneratedObituaryOpenAI: (value: string) => void;
  setGeneratedObituaryClaude: (value: string) => void;
}) {
  return (
    <article className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <h4 className="font-semibold">OpenAI:</h4>
        <div className="whitespace-pre-wrap">{generatedObituaryOpenAI}</div>
      </div>

      <div className="flex flex-col gap-4 border-t pt-4">
        <h4 className="font-semibold">Claude:</h4>
        <div className="whitespace-pre-wrap">{generatedObituaryClaude}</div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => {
            setGeneratedObituaryOpenAI("");
            setGeneratedObituaryClaude("");
          }}
        >
          Clear Output
        </Button>
        {/* Add options to copy, save, etc. here */}
      </div>
    </article>
  );
}
