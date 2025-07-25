import { env } from "@/lib/env/server";
import crypto from "crypto";
import { Resend } from "resend";

export const resend = new Resend(env.RESEND_API_KEY);

/**
 * Adds an email to the Mailchimp list after checking if it already exists
 * @param email - Email to add to the list
 * @returns Response from Mailchimp API
 */
export async function mailchimp({ email }: { email: string }) {
  try {
    const subscriberHash = crypto
      .createHash("md5")
      .update(email.toLowerCase())
      .digest("hex");

    const response = await fetch(
      `https://us11.api.mailchimp.com/3.0/lists/${env.MAILCHIMP_LIST_ID}/members/${subscriberHash}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.MAILCHIMP_API_KEY}`,
        },
        body: JSON.stringify({
          email_address: email,
          status_if_new: "pending",
        }),
      }
    );

    const data = await response.json();
    return { ...data };
  } catch (error) {
    console.error("Error adding email to Mailchimp:", error);
    return { error: "Failed to add email to Mailchimp" };
  }
}
