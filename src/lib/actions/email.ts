"use server";

import { EmailTemplate } from "@/components/email/template";
import { z } from "zod";
import { mailchimp, resend } from "../api/email";
import { action } from "./utils";

const emailSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  message: z.string().min(1, "Message is required"),
});

const waitlistSchema = z.object({
  email: z.email("Invalid email address"),
});

export const emailAction = action(emailSchema, async (_, formData) => {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  if (!name || !email || !message) {
    return { error: "Missing name, email, or message" };
  }

  try {
    await resend.emails.send({
      from: `FinalSpaces <${process.env.RESEND_EMAIL_FROM as string}>`,
      to: [process.env.RESEND_EMAIL_TO as string],
      subject: "New message from FinalSpaces",
      react: EmailTemplate({ name, email, message }) as React.ReactElement,
    });
    return { success: "Email sent successfully" };
  } catch (error) {
    console.error(error);
    return { error: "Failed to send email" };
  }
});

export const waitlistAction = action(waitlistSchema, async (_, formData) => {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Missing email" };
  }

  try {
    await mailchimp({ email });
    return { success: "Email added to waitlist successfully" };
  } catch (error) {
    console.error(error);
    return { error: "Failed to add email to waitlist" };
  }
});
