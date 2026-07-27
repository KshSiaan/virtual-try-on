import { relations } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

export const friendReq = pgTable(
  "friend_requests",
  {
    id: text("id").primaryKey(),

    senderID: text("sender_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    receiverID: text("receiver_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    status: text("status").notNull(), // pending | accepted | rejected

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("friendReq_sender_idx").on(table.senderID),
    index("friendReq_receiver_idx").on(table.receiverID),

    // prevents duplicate requests
    uniqueIndex("friend_request_unique_idx").on(
      table.senderID,
      table.receiverID
    ),
  ]
);

export const friendReqRelations = relations(friendReq, ({ one }) => ({
  sender: one(user, {
    fields: [friendReq.senderID],
    references: [user.id],
  }),

  receiver: one(user, {
    fields: [friendReq.receiverID],
    references: [user.id],
  }),
}));