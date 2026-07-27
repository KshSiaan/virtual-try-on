import { relations } from "drizzle-orm";
import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";


export const tryon = pgTable(
  "tryon",
  {
    id: text("id").primaryKey(),
    authorId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    //tryonDataset
    name: text("name").notNull(),
    description: text("description"),
    isPublic: boolean("is_public").default(false).notNull(),
    image: text("image").notNull(),
    type: text("type"),
    size: text("size"),
    fit: text("fit"),
    chest: text("chest"),
    shoulder: text("shoulder"),
    sleeve: text("sleeve"),
    waist: text("waist"), 
    rise: text("rise"),
    inseam: text("inseam"),    
    head: text("head"),
    shoe: text("shoe"),
  },
  (table) => [index("tryon_userId_idx").on(table.authorId)],
);

export const tryonRelations = relations(tryon, ({ one }) => ({
  author: one(user, {
    fields: [tryon.authorId],
    references: [user.id],
  }),
}));