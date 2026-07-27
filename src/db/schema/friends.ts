import { relations } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

export const friends = pgTable(
  "friends",
  {
    id: text("id").primaryKey(),

    userAId: text("user_a_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    userBId: text("user_b_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    
    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("friends_userA_idx").on(table.userAId),
    index("friends_userB_idx").on(table.userBId),

    // prevents duplicate friendships
    uniqueIndex("friends_unique_idx").on(
      table.userAId,
      table.userBId
    ),
  ]
);

export const friendsRelations = relations(friends, ({ one }) => ({
  userA: one(user, {
    fields: [friends.userAId],
    references: [user.id],
  }),

  userB: one(user, {
    fields: [friends.userBId],
    references: [user.id],
  }),
}));