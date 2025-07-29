"use server";

import { db } from "@/lib/db";
import { userGeneratedImage } from "@/lib/db/schema";
import type { ActionState } from "@/types/state";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  fetchTemplates,
  generateImage,
  type PlacidRequest,
} from "../api/placid";

export async function createEpitaphs(
  formData: PlacidRequest,
  userId: string,
  deceasedId: string
): Promise<ActionState> {
  try {
    const templates = await fetchTemplates();
    const variables = {
      portrait: formData.portrait.toString(),
      name: formData.name.toString(),
      epitaph: formData.epitaph.toString(),
      citation: formData.citation.toString(),
      birth: formData.birth.toString(),
      death: formData.death.toString(),
    };

    const epitaphs = templates.data.map((template) => {
      return generateImage({
        templateId: template.uuid,
        variables: variables,
      });
    });

    const results = await Promise.allSettled(epitaphs);

    const successfulResults = results.filter(
      (result) => result.status === "fulfilled"
    );

    const epitaphIds = successfulResults.map((result) => {
      if (result.status === "fulfilled") {
        return result.value.id;
      }
      return null;
    });

    console.log("Successful results", successfulResults);
    console.log("Epitaph IDs", epitaphIds);

    // Store each generated image in the database
    const dbInsertPromises = successfulResults.map((result, index) => {
      if (result.status === "fulfilled") {
        const template = templates.data[index];
        return db.insert(userGeneratedImage).values({
          id: crypto.randomUUID(),
          userId: userId,
          epitaphId: result.value.id,
          templateId: template.uuid,
          deceasedId: deceasedId,
          metadata: {
            variables: variables,
            templateName: template.title || "Unknown template",
            generatedAt: new Date().toISOString(),
          },
        });
      }
      return Promise.resolve(); // Skip failed generations
    });

    // Execute all database insertions in parallel
    await Promise.all(dbInsertPromises.filter(Boolean));

    return { result: epitaphIds.filter((id) => id !== null) as number[] };
  } catch (error) {
    console.error("Error creating epitaphs:", error);
    return { error: "Failed to create epitaphs" };
  }
}

export async function deleteImage(id: string) {
  try {
    await db.delete(userGeneratedImage).where(eq(userGeneratedImage.id, id));
    revalidatePath("/dashboard/epitaphs");
    return { result: "Image deleted successfully" };
  } catch (error) {
    console.error("Error deleting image:", error);
    return { error: "Failed to delete image" };
  }
}
