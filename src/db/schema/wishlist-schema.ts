import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { closet } from "./closet-schema";

export const wishlist = pgTable(
  "wishlist",
  {
    id: text("id").primaryKey(),
    authorId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    closetItemId: text("closet_item_id")
      .notNull()
      .references(() => closet.id, { onDelete: "cascade" }),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("wishlist_userId_idx").on(table.authorId),
    index("wishlist_closetItemId_idx").on(table.closetItemId),
    uniqueIndex("wishlist_user_closet_unique_idx").on(table.authorId, table.closetItemId),
  ],
);

export const wishlistRelations = relations(wishlist, ({ one }) => ({
  author: one(user, {
    fields: [wishlist.authorId],
    references: [user.id],
  }),
  closetItem: one(closet, {
    fields: [wishlist.closetItemId],
    references: [closet.id],
  }),
}));
