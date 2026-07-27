CREATE TABLE "closet" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"image" text NOT NULL,
	"type" text,
	"size" text,
	"fit" text,
	"chest" text,
	"shoulder" text,
	"sleeve" text
);
--> statement-breakpoint
CREATE TABLE "tryon" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"image" text NOT NULL,
	"type" text,
	"size" text,
	"fit" text,
	"chest" text,
	"shoulder" text,
	"sleeve" text,
	"waist" text,
	"rise" text,
	"inseam" text,
	"head" text,
	"shoe" text
);
--> statement-breakpoint
CREATE TABLE "wishlist" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"closet_item_id" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "closet" ADD CONSTRAINT "closet_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tryon" ADD CONSTRAINT "tryon_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_closet_item_id_closet_id_fk" FOREIGN KEY ("closet_item_id") REFERENCES "public"."closet"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "closet_userId_idx" ON "closet" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tryon_userId_idx" ON "tryon" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "wishlist_userId_idx" ON "wishlist" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "wishlist_closetItemId_idx" ON "wishlist" USING btree ("closet_item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wishlist_user_closet_unique_idx" ON "wishlist" USING btree ("user_id","closet_item_id");