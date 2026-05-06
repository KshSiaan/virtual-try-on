import { relations } from "drizzle-orm";
import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";


export const closet = pgTable(
  "closet",
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
    //closetDataset
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
  },
  (table) => [index("closet_userId_idx").on(table.authorId)],
);

export const closetRelations = relations(closet, ({ one }) => ({
  author: one(user, {
    fields: [closet.authorId],
    references: [user.id],
  }),
}));