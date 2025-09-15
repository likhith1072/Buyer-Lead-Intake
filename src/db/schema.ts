
import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  json,
} from "drizzle-orm/pg-core";

import { InferSelectModel } from "drizzle-orm";

// export const users = pgTable("users", {
//   id: uuid("id").defaultRandom().primaryKey(),
//   email: varchar("email", { length: 255 }).notNull(),
//   name: varchar("name", { length: 255 }),
//   password: varchar("password", { length: 255 }).notNull(),
//   createdAt: timestamp("created_at").defaultNow(),
// });


export const buyers = pgTable("buyers", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: varchar("full_name", { length: 80 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 15 }).notNull(),
  city: varchar("city", { length: 32 }).notNull(), // will store one of defined enums
  propertyType: varchar("property_type", { length: 32 }).notNull(),
  bhk: varchar("bhk", { length: 16 }), // optional
  purpose: varchar("purpose", { length: 16 }).notNull(),
  budgetMin: integer("budget_min"),
  budgetMax: integer("budget_max"),
  timeline: varchar("timeline", { length: 32 }).notNull(),
  source: varchar("source", { length: 32 }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("New"),
  notes: varchar("notes", { length: 1000 }),
  tags: json("tags").$type<string[] | null>().default(null),
   // 👇 Clerk user.id stored as string
  ownerId: varchar("owner_id", { length: 255 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Single field change type
type FieldChange<T> = {
  old?: T;
  new?: T;
};

// Diff for updates: only changed fields
type Diff<T> = Partial<Record<keyof T, FieldChange<T[keyof T]>>>;

// History entry type: supports both create and update actions
export type BuyerHistoryEntry =
  | {
      action: "create";
      new: Buyer; // full object for created buyer
    }
  | {
      action: "update";
      changes: Diff<Buyer>; // only fields that changed
    };



export const buyer_history = pgTable("buyer_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  buyerId: uuid("buyer_id").notNull(),
  changedBy: varchar("changed_by", { length: 255 }).notNull(), // Clerk user.id
  changedAt: timestamp("changed_at").defaultNow().notNull(),
  diff: json("diff").$type<BuyerHistoryEntry>().notNull(), // JSON object describing changed fields
});



export type Buyer = InferSelectModel<typeof buyers>;