import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { affiliateProduct } from "./affiliate-schema";

export const affiliateWishlist = pgTable(
  "affiliate_wishlist",
  {
    id: text("id").primaryKey(),
    authorId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    affiliateProductId: text("affiliate_product_id")
      .notNull()
      .references(() => affiliateProduct.id, { onDelete: "cascade" }),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("affiliate_wishlist_userId_idx").on(table.authorId),
    index("affiliate_wishlist_productId_idx").on(table.affiliateProductId),
    uniqueIndex("affiliate_wishlist_user_product_unique_idx").on(
      table.authorId,
      table.affiliateProductId,
    ),
  ],
);

export const affiliateWishlistRelations = relations(affiliateWishlist, ({ one }) => ({
  author: one(user, {
    fields: [affiliateWishlist.authorId],
    references: [user.id],
  }),
  product: one(affiliateProduct, {
    fields: [affiliateWishlist.affiliateProductId],
    references: [affiliateProduct.id],
  }),
}));
