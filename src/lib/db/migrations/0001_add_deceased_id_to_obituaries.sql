-- Migration: Add deceased_id column to obituaries table
-- This creates the relation between obituaries and deceased tables

-- Add the deceased_id column to obituaries table
ALTER TABLE "obituaries" ADD COLUMN "deceased_id" uuid;

-- Add foreign key constraint
ALTER TABLE "obituaries" ADD CONSTRAINT "obituaries_deceased_id_deceased_id_fk" 
FOREIGN KEY ("deceased_id") REFERENCES "public"."deceased"("id") ON DELETE cascade ON UPDATE no action;

-- Note: The column is initially nullable to allow for existing records
-- You may want to populate existing records with appropriate deceased_id values
-- and then make the column NOT NULL in a subsequent migration
