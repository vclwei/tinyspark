import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  avatarKey: text("avatar_key"),
  role: text("role", { enum: ["admin", "user"] }).notNull().default("user"),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

export const artworks = sqliteTable("artworks", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  artistName: text("artist_name").notNull(),
  description: text("description"),
  tags: text("tags"),
  imageId: text("image_id").notNull(),
  isPublic: integer("is_public", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
  artworkDate: text("artwork_date"),
});

export const likes = sqliteTable(
  "likes",
  {
    userId: text("user_id").notNull().references(() => users.id),
    artworkId: text("artwork_id").notNull().references(() => artworks.id, { onDelete: "cascade" }),
    createdAt: text("created_at").notNull().default("(datetime('now'))"),
  },
  (table) => [primaryKey({ columns: [table.userId, table.artworkId] })]
);
