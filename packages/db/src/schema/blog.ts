import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const contentType = pgEnum("content_type", ["article", "video", "podcast", "other"]);

export const content = pgTable("content", {
  id: text("id").primaryKey(),
  type: contentType().notNull(),
  title: text("title").notNull(),
  content: text("content").notNull().unique(),
  cover: text("cover"),
  authorId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
