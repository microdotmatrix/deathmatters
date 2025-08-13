"use server";

import { getSession } from "@/lib/auth/server";
import { db } from "@/lib/db"; // Your Drizzle DB instance
import { obituaries, obituariesDraft } from "@/lib/db/schema"; // Your Drizzle schema for obituaries
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { smoothStream, streamText } from "ai";
import { createStreamableValue } from "ai/rsc";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface ObituaryInput {
  fullName: string;
  birthDate: string;
  deathDate: string;
  biographySummary: string;
  accomplishments?: string;
  hobbiesInterests?: string;
  survivedBy?: string;
  predeceasedBy?: string;
  serviceDetails?: string;
  tone?: string;
}

const systemPrompt =
  "You are an compassionate and eloquent obituary writer. Your task is to write a respectful and heartfelt obituary based on the provided information.";

function formatPrompt(inputData: ObituaryInput) {
  const prompt = `
    Write an obituary for the following person:

    Deceased Name: ${inputData.fullName}
    Born: ${inputData.birthDate}
    Died: ${inputData.deathDate}

    Biography/Life Summary: ${inputData.biographySummary}

    ${
      inputData.accomplishments
        ? `Key Accomplishments & Achievements: ${inputData.accomplishments}`
        : ""
    }
    ${
      inputData.hobbiesInterests
        ? `Hobbies & Interests: ${inputData.hobbiesInterests}`
        : ""
    }
    ${inputData.survivedBy ? `Survived By: ${inputData.survivedBy}` : ""}
    ${
      inputData.predeceasedBy
        ? `Predeceased By: ${inputData.predeceasedBy}`
        : ""
    }
    ${
      inputData.serviceDetails
        ? `Funeral/Service Details: ${inputData.serviceDetails}`
        : ""
    }

    ${
      inputData.tone
        ? `The desired tone for this obituary is: ${inputData.tone}.`
        : "The tone should be reverent and respectful."
    }

    Please write the obituary. Focus on celebrating their life, contributions, and legacy. Ensure the language is dignified and appropriate.
    Include a starting sentence and an ending sentiment (e.g., "They will be dearly missed.").
    The obituary should be concise but comprehensive, around 200-400 words.
  `;

  return prompt;
}

async function createObituaryQuery(
  userId: string,
  deceasedId: string,
  inputData: ObituaryInput,
  model: string,
  generatedText: string,
  tokenUsage: number
) {
  await db.insert(obituaries).values({
    fullName: inputData.fullName,
    birthDate: inputData.birthDate,
    deathDate: inputData.deathDate,
    // Store a clean version of inputData, not FormData directly
    inputData: { ...inputData },
    generatedText: "",
    generatedTextClaude: model === "claude" ? generatedText : "",
    generatedTextOpenAI: model === "openai" ? generatedText : "",
    generatedTextClaudeTokens: model === "claude" ? tokenUsage : 0,
    generatedTextOpenAITokens: model === "openai" ? tokenUsage : 0,
    deceasedId: deceasedId,
    userId: userId,
  });
}

async function createObituaryRecord(
  userId: string,
  deceasedId: string,
  formData: FormData
) {
  const inputData: ObituaryInput = {
    fullName: formData.get("fullName") as string,
    birthDate: formData.get("birthDate") as string,
    deathDate: formData.get("deathDate") as string,
    biographySummary: formData.get("biographySummary") as string,
    accomplishments: formData.get("accomplishments") as string,
    hobbiesInterests: formData.get("hobbiesInterests") as string,
    survivedBy: formData.get("survivedBy") as string,
    predeceasedBy: formData.get("predeceasedBy") as string,
    serviceDetails: formData.get("serviceDetails") as string,
    tone: formData.get("tone") as string,
  };

  const result = await db
    .insert(obituaries)
    .values({
      fullName: inputData.fullName,
      birthDate: inputData.birthDate,
      deathDate: inputData.deathDate,
      inputData: { ...inputData },
      generatedText: "",
      generatedTextClaude: "",
      generatedTextOpenAI: "",
      generatedTextClaudeTokens: 0,
      generatedTextOpenAITokens: 0,
      deceasedId: deceasedId,
      userId: userId,
    })
    .returning();

  return result;
}

async function createObituaryDraft(userId: string, formData: FormData) {
  const inputData: ObituaryInput = {
    fullName: formData.get("fullName") as string,
    birthDate: formData.get("birthDate") as string,
    deathDate: formData.get("deathDate") as string,
    biographySummary: formData.get("biographySummary") as string,
    accomplishments: formData.get("accomplishments") as string,
    hobbiesInterests: formData.get("hobbiesInterests") as string,
    survivedBy: formData.get("survivedBy") as string,
    predeceasedBy: formData.get("predeceasedBy") as string,
    serviceDetails: formData.get("serviceDetails") as string,
    tone: formData.get("tone") as string,
  };

  const result = await db
    .insert(obituariesDraft)
    .values({
      inputData: { ...inputData },
      userId: userId,
    })
    .returning();

  return result;
}

async function updateObituaryDraft(
  draftId: string,
  userId: string,
  formData: FormData
) {
  const inputData: ObituaryInput = {
    fullName: formData.get("fullName") as string,
    birthDate: formData.get("birthDate") as string,
    deathDate: formData.get("deathDate") as string,
    biographySummary: formData.get("biographySummary") as string,
    accomplishments: formData.get("accomplishments") as string,
    hobbiesInterests: formData.get("hobbiesInterests") as string,
    survivedBy: formData.get("survivedBy") as string,
    predeceasedBy: formData.get("predeceasedBy") as string,
    serviceDetails: formData.get("serviceDetails") as string,
    tone: formData.get("tone") as string,
  };

  const result = await db
    .update(obituariesDraft)
    .set({
      inputData: { ...inputData },
      updatedAt: new Date(),
    })
    .where(eq(obituariesDraft.id, draftId))
    .returning();

  return result;
}

async function updateObituaryRecord(
  id: string,
  model: string,
  generatedText: string,
  tokenUsage: number
) {
  if (model === "claude") {
    await db
      .update(obituaries)
      .set({
        generatedTextClaude: generatedText,
        generatedTextClaudeTokens: tokenUsage,
      })
      .where(eq(obituaries.id, id));
  } else if (model === "openai") {
    await db
      .update(obituaries)
      .set({
        generatedTextOpenAI: generatedText,
        generatedTextOpenAITokens: tokenUsage,
      })
      .where(eq(obituaries.id, id));
  }
}

export async function generateClaudeObituary(
  id: string,
  formData: FormData,
  stream: any
) {
  try {
    const inputData: ObituaryInput = {
      fullName: formData.get("fullName") as string,
      birthDate: formData.get("birthDate") as string,
      deathDate: formData.get("deathDate") as string,
      biographySummary: formData.get("biographySummary") as string,
      accomplishments: formData.get("accomplishments") as string,
      hobbiesInterests: formData.get("hobbiesInterests") as string,
      survivedBy: formData.get("survivedBy") as string,
      predeceasedBy: formData.get("predeceasedBy") as string,
      serviceDetails: formData.get("serviceDetails") as string,
      tone: formData.get("tone") as string,
    };

    const prompt = formatPrompt(inputData);

    let generatedText = "";
    let tokenUsage = 0;

    (async () => {
      const { textStream } = await streamText({
        model: anthropic("claude-3-5-sonnet-latest"),
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        maxTokens: 1000,
        experimental_transform: smoothStream({ chunking: "word" }),
        onFinish: ({
          usage,
        }: {
          usage: {
            promptTokens: number;
            completionTokens: number;
            totalTokens: number;
          };
        }) => {
          const { promptTokens, completionTokens, totalTokens } = usage;
          console.log("Prompt Tokens:", promptTokens);
          console.log("Completion Tokens:", completionTokens);
          console.log("Total Tokens:", totalTokens);
          tokenUsage = totalTokens;
        },
      });
      for await (const delta of textStream) {
        generatedText += delta;
        stream.update(delta);
      }

      stream.done();

      await updateObituaryRecord(id, "claude", generatedText, tokenUsage);
    })();

    return {
      success: true,
      obituary: stream.value,
    };
  } catch (error: any) {
    console.error("Error generating obituary:", error);
    return {
      success: false,
      error: error.message || "An unknown error occurred.",
    };
  }
}

export async function generateOpenAIObituary(
  id: string,
  formData: FormData,
  stream: any
) {
  try {
    const inputData: ObituaryInput = {
      fullName: formData.get("fullName") as string,
      birthDate: formData.get("birthDate") as string,
      deathDate: formData.get("deathDate") as string,
      biographySummary: formData.get("biographySummary") as string,
      accomplishments: formData.get("accomplishments") as string,
      hobbiesInterests: formData.get("hobbiesInterests") as string,
      survivedBy: formData.get("survivedBy") as string,
      predeceasedBy: formData.get("predeceasedBy") as string,
      serviceDetails: formData.get("serviceDetails") as string,
      tone: formData.get("tone") as string,
    };

    const prompt = formatPrompt(inputData);

    let generatedText = "";
    let tokenUsage = 0;

    (async () => {
      const { textStream } = await streamText({
        model: openai("gpt-4o"),
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        maxTokens: 1000,
        experimental_transform: smoothStream({ chunking: "word" }),
        onFinish: ({
          usage,
        }: {
          usage: {
            promptTokens: number;
            completionTokens: number;
            totalTokens: number;
          };
        }) => {
          const { promptTokens, completionTokens, totalTokens } = usage;
          console.log("Prompt Tokens:", promptTokens);
          console.log("Completion Tokens:", completionTokens);
          console.log("Total Tokens:", totalTokens);
          tokenUsage = totalTokens;
        },
      });
      for await (const delta of textStream) {
        generatedText += delta;
        stream.update(delta);
      }

      stream.done();

      await updateObituaryRecord(id, "openai", generatedText, tokenUsage);
    })();

    return {
      success: true,
      obituary: stream.value,
    };
  } catch (error: any) {
    console.error("Error generating obituary:", error);
    return {
      success: false,
      error: error.message || "An unknown error occurred.",
    };
  }
}

export async function generateObituaries(formData: FormData) {
  try {
    const { user } = await getSession();
    if (!user) {
      return {
        success: false,
        error: "Must be logged in to generate an obituary.",
      };
    }
    const deceasedId = formData.get("deceasedId") as string;
    const entry = await createObituaryRecord(user.id, deceasedId, formData);

    const claudeStream = createStreamableValue("");
    const openaiStream = createStreamableValue("");

    const [claude, openai] = await Promise.all([
      generateClaudeObituary(entry[0].id, formData, claudeStream),
      generateOpenAIObituary(entry[0].id, formData, openaiStream),
    ]);

    revalidatePath("/obituaries"); // Revalidate the page where the form is located

    return {
      success: true,
      obituary: {
        claude: claude.obituary,
        openai: openai.obituary,
      },
    };
  } catch (error: any) {
    console.error("Error generating obituary:", error);
    return {
      success: false,
      error: error.message || "An unknown error occurred.",
    };
  }
}

type ActionState = {
  success: boolean;
  error?: string;
  stream?: {
    claude?: ReadableStream;
    openai?: ReadableStream;
  };
};

export async function generateObituariesAlt(
  initialState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { user } = await getSession();
    const deceasedId = formData.get("deceasedId") as string;
    const entry = await createObituaryRecord(user?.id!, deceasedId, formData);

    const claudeStream = createStreamableValue("");
    const openaiStream = createStreamableValue("");

    const [claude, openai] = await Promise.all([
      generateClaudeObituary(entry[0].id, formData, claudeStream),
      generateOpenAIObituary(entry[0].id, formData, openaiStream),
    ]);

    revalidatePath("/obituaries"); // Revalidate the page where the form is located

    return {
      success: true,
      stream: {
        claude: claude.obituary,
        openai: openai.obituary,
      },
    };
  } catch (error: any) {
    console.error("Error generating obituary:", error);
    return {
      success: false,
      error: error.message || "An unknown error occurred.",
    };
  }
}

export async function saveObituaryFormDraft(formData: FormData) {
  try {
    const { user } = await getSession();
    if (!user) {
      return {
        success: false,
        error: "Must be logged in to save a draft.",
      };
    }

    const draftId = formData.get("draftId") as string;

    if (draftId) {
      // Update existing draft
      const result = await updateObituaryDraft(draftId, user.id, formData);
      return { success: true, draftId: result[0].id };
    } else {
      // Create new draft
      const result = await createObituaryDraft(user.id, formData);
      return { success: true, draftId: result[0].id };
    }
  } catch (error: any) {
    console.error("Error saving draft:", error);
    return {
      success: false,
      error: error.message || "An unknown error occurred.",
    };
  }
}
