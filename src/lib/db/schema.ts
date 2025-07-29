import {
  boolean,
  integer,
  json,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role"),
  banned: boolean("banned"),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  activeOrganizationId: text("active_organization_id"),
  impersonatedBy: text("impersonated_by"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
});

export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  logo: text("logo"),
  createdAt: timestamp("created_at").notNull(),
  metadata: text("metadata"),
});

export const member = pgTable("member", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").default("member").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const invitation = pgTable("invitation", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const deceased = pgTable("deceased", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  birthDate: text("birth_date").notNull(),
  deathDate: text("death_date").notNull(),
  birthLocation: text("birth_location"),
  image: text("image").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const userUpload = pgTable("user_upload", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  storageProvider: text("storage_provider").notNull(), // e.g., 'S3', 'Cloudinary', etc.
  storageKey: text("storage_key").notNull(), // The key/path in the storage service
  metadata: json("metadata"), // For storing additional metadata like dimensions, EXIF data, etc.
  isPublic: boolean("is_public")
    .$defaultFn(() => false)
    .notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const savedQuotes = pgTable("saved_quotes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  quote: text("quote").notNull(),
  author: text("author").notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const obituaries = pgTable("obituaries", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: text("full_name").notNull(),
  birthDate: text("birth_date").notNull(), // Store as text 'YYYY-MM-DD'
  deathDate: text("death_date").notNull(), // Store as text 'YYYY-MM-DD'
  // Storing input data as JSONB is flexible. Consider a more granular schema
  // if you need to query specific input fields frequently.
  inputData: jsonb("input_data"), // Store the raw form input as JSONB
  generatedText: text("generated_text").notNull(),
  generatedTextClaude: text("generated_text_claude").notNull(),
  generatedTextOpenAI: text("generated_text_openai").notNull(),
  generatedTextClaudeTokens: integer("generated_text_claude_tokens").notNull(),
  generatedTextOpenAITokens: integer("generated_text_openai_tokens").notNull(),
  // Foreign key to relate obituary to deceased person
  deceasedId: uuid("deceased_id")
    .notNull()
    .references(() => deceased.id, { onDelete: "cascade" }),
  // Add more fields if needed, e.g., userId for associating with a user account
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// Define the structure of obituary input data
export interface ObituaryInputData {
  fullName: string;
  birthDate?: string;
  deathDate?: string;
  biographySummary?: string;
  accomplishments?: string;
  hobbiesInterests?: string;
  survivedBy?: string;
  predeceasedBy?: string;
  serviceDetails?: string; // Stored as a string in the existing implementation
  tone?: string;
  // Additional fields that might be used in the form
  age?: number;
  location?: string;
  occupation?: string;
  achievements?: string;
  hobbies?: string;
  familyMembers?: {
    id: string;
    name: string;
    relationship: string;
    location?: string;
  }[];
}

export const obituariesDraft = pgTable("obituaries_draft", {
  id: uuid("id").defaultRandom().primaryKey(),
  // Storing input data as JSONB with a defined type
  inputData: jsonb("input_data").$type<ObituaryInputData>(), // Typed as ObituaryInputData
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const userGeneratedImage = pgTable("user_generated_image", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  epitaphId: integer("epitaph_id").notNull(), // ID from the Placid API
  templateId: text("template_id"), // Template ID used for generation
  imageUrl: text("image_url"), // URL to access the generated image (optional, can be populated later)
  metadata: json("metadata"), // For storing additional metadata about the generation
  status: text("status")
    .$defaultFn(() => "generated")
    .notNull(), // e.g., 'generated', 'processed', 'failed'
  // Foreign key to relate obituary to deceased person
  deceasedId: uuid("deceased_id")
    .notNull()
    .references(() => deceased.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export type Deceased = typeof deceased.$inferSelect;
export type UserUpload = typeof userUpload.$inferSelect;
export type SavedQuote = typeof savedQuotes.$inferSelect;
export type Obituary = typeof obituaries.$inferSelect;
export type ObituaryDraft = typeof obituariesDraft.$inferSelect;
export type UserGeneratedImage = typeof userGeneratedImage.$inferSelect;
