import "server-only";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return {
      error: "User not authorized",
    };
  }

  return {
    session,
    user: session?.user,
  };
}

export async function isAuthorized() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/login");
  }
}
