import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const affiliateProduct = pgTable(
  "affiliate_products",
  {
    id: text("id").primaryKey(),

    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),

    // product info
    name: text("name").notNull(),
    description: text("description"),

    image: text("image").notNull(),

    type: text("type"),
    size: text("size"),
    fit: text("fit"),

    chest: text("chest"),
    shoulder: text("shoulder"),
    sleeve: text("sleeve"),

    // affiliate specific
    affiliateUrl: text("affiliate_url").notNull(),

    brand: text("brand"),

    price: integer("price"),

    currency: text("currency").default("USD"),

    storeName: text("store_name"),

    isActive: boolean("is_active").default(true).notNull(),

  },
  (table) => [
    index("affiliate_products_author_id_idx").on(table.authorId),
    index("affiliate_products_type_idx").on(table.type),
    index("affiliate_products_brand_idx").on(table.brand),
  ],
);

export const affiliateProductRelations = relations(
  affiliateProduct,
  ({ one }) => ({
    author: one(user, {
      fields: [affiliateProduct.authorId],
      references: [user.id],
    }),
  }),
);