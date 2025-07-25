"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";
import { utapi } from "../api/uploads";
import { getSession } from "../auth/server";
import { db } from "../db";
import { deceased, userUpload } from "../db/schema";
import { action } from "./utils";

const CreateSchema = z.object({
  name: z.string().min(1),
  birthDate: z.string(),
  deathDate: z.string(),
  birthLocation: z.string().min(1),
  image: z.string().min(1),
});

export const createDeceased = action(CreateSchema, async (_, formData) => {
  const session = await getSession();

  if (!session?.user) {
    return {
      error: "User not authorized",
    };
  }

  try {
    const { name, birthDate, deathDate, birthLocation, image } =
      Object.fromEntries(formData);

    await db.insert(deceased).values({
      name: name as string,
      birthDate: birthDate as string,
      deathDate: deathDate as string,
      birthLocation: birthLocation as string,
      image: image as string,
      userId: session.user.id,
    });

    revalidatePath("/portal");

    return {
      success: "New entry created successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      error: "Error creating new entry",
    };
  }
});

const UpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  birthDate: z.string(),
  deathDate: z.string(),
  birthLocation: z.string().min(1),
  image: z.string().min(1),
});

export const updateDeceased = action(UpdateSchema, async (_, formData) => {
  const session = await getSession();

  if (!session?.user) {
    return {
      error: "User not authorized",
    };
  }

  try {
    const { id, name, birthDate, deathDate, birthLocation, image } =
      Object.fromEntries(formData);

    await db
      .update(deceased)
      .set({
        name: name as string,
        birthDate: birthDate as string,
        deathDate: deathDate as string,
        birthLocation: birthLocation as string,
        image: image as string,
        updatedAt: new Date(),
      })
      .where(eq(deceased.id, id as string));

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/${id}`);

    return {
      success: "Entry updated successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      error: "Error updating entry",
    };
  }
});

export const deleteDeceased = async (id: string) => {
  const session = await getSession();

  if (!session?.user) {
    return {
      error: "User not authorized",
    };
  }

  try {
    await db.delete(deceased).where(eq(deceased.id, id as string));

    revalidatePath("/portal");

    return {
      success: "Entry deleted successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      error: "Error deleting entry",
    };
  }
};

export const deleteFile = async (key: string) => {
  const session = await getSession();
  if (!session?.user) {
    throw new UploadThingError("Unauthorized");
  }
  try {
    await utapi.deleteFiles(key);
    await db.delete(userUpload).where(eq(userUpload.storageKey, key));

    revalidatePath("/auth");

    return {
      success: "File deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting file:", error);
    return {
      error: "Error deleting file",
    };
  }
};
