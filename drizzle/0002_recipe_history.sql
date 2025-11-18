CREATE TABLE "recipe_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipe_id" uuid NOT NULL,
	"household_id" uuid NOT NULL,
	"cooked_by" uuid NOT NULL,
	"servings" integer NOT NULL,
	"cooked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recipe_history" ADD CONSTRAINT "recipe_history_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_history" ADD CONSTRAINT "recipe_history_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_history" ADD CONSTRAINT "recipe_history_cooked_by_users_id_fk" FOREIGN KEY ("cooked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_recipe_history_recipe" ON "recipe_history" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "idx_recipe_history_household" ON "recipe_history" USING btree ("household_id");--> statement-breakpoint
CREATE INDEX "idx_recipe_history_date" ON "recipe_history" USING btree ("cooked_at");
