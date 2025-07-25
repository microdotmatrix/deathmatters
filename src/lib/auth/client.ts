import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const client = createAuthClient({
  baseURL: process.env.BASE_URL!,
  plugins: [adminClient()],
});

export const { signIn, signOut, signUp, useSession, admin } = client;
