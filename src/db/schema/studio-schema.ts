import { relations } from "drizzle-orm";
import { index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { tryon } from "./tryon-schema";
import { closet } from "./closet-schema";

export const studio = pgTable(
  "studio",
  {
    id: text("id").primaryKey(),
    authorId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    tryonId: text("tryon_id")
      .notNull()
      .references(() => tryon.id, { onDelete: "restrict" }),
    resultImageUrl: text("result_image_url").notNull(),
    caption: text("caption"),
    model: text("model"),
    size: text("size"),
    affiliateItemCount: integer("affiliate_item_count").notNull().default(0),
    closetItemCount: integer("closet_item_count").notNull().default(0),
    status: text("status").notNull().default("completed"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("studio_userId_idx").on(table.authorId),
    index("studio_tryonId_idx").on(table.tryonId),
    index("studio_status_idx").on(table.status),
  ],
);

export const studioClosetItem = pgTable(
  "studio_closet_item",
  {
    id: text("id").primaryKey(),
    studioId: text("studio_id")
      .notNull()
      .references(() => studio.id, { onDelete: "cascade" }),
    closetItemId: text("closet_item_id")
      .notNull()
      .references(() => closet.id, { onDelete: "restrict" }),
    sortOrder: integer("sort_order").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("studio_closet_item_studioId_idx").on(table.studioId),
    index("studio_closet_item_closetItemId_idx").on(table.closetItemId),
    uniqueIndex("studio_closet_item_unique_idx").on(table.studioId, table.closetItemId),
  ],
);

export const studioRelations = relations(studio, ({ one, many }) => ({
  author: one(user, {
    fields: [studio.authorId],
    references: [user.id],
  }),
  tryonItem: one(tryon, {
    fields: [studio.tryonId],
    references: [tryon.id],
  }),
  closetItems: many(studioClosetItem),
}));

export const studioClosetItemRelations = relations(studioClosetItem, ({ one }) => ({
  studio: one(studio, {
    fields: [studioClosetItem.studioId],
    references: [studio.id],
  }),
  closetItem: one(closet, {
    fields: [studioClosetItem.closetItemId],
    references: [closet.id],
  }),
}));