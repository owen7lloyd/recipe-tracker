CREATE TABLE "household_category_order" (
	"household_id" uuid PRIMARY KEY NOT NULL,
	"category_order" text[] DEFAULT ARRAY['produce','bakery','dairy','meat','seafood','frozen','pantry','other'] NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "household_category_order" ADD CONSTRAINT "household_category_order_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;
