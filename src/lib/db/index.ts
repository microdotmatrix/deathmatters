import { env } from "@/lib/env/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// config({ path: ".env.local" }); // or .env.local

const sql = neon(env.DATABASE_URL!);

export const db = drizzle(sql, { schema });
