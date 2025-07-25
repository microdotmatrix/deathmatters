"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { action } from "./utils";

import { LoginSchema, SignUpSchema } from "@/lib/auth/types";

export const loginEmail = action(LoginSchema, async (data) => {
  const { email, password } = data;

  await auth.api.signInEmail({
    body: { email, password },
  });

  redirect("/");
});

export const signUpEmail = action(SignUpSchema, async (data) => {
  const { email, password, name } = data;

  await auth.api.signUpEmail({
    body: { email, password, name },
  });

  redirect("/");
});
