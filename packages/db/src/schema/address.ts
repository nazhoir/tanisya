import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index, boolean } from "drizzle-orm/pg-core";
import { user, organization } from "./auth";

export const address = pgTable("address", {
  id: text("id").primaryKey(),
  line1: text("line1").notNull(),
  line2: text("line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const userAddress = pgTable(
  "user_address",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    addressId: text("address_id")
      .notNull()
      .references(() => address.id, { onDelete: "cascade" }),
    label: text("label"), // misal: "home", "billing", "shipping"
    isDefault: boolean("is_default").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("user_address_userId_idx").on(table.userId),
    index("user_address_addressId_idx").on(table.addressId),
  ]
);

export const organizationAddress = pgTable(
  "organization_address",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    addressId: text("address_id")
      .notNull()
      .references(() => address.id, { onDelete: "cascade" }),
    label: text("label"), // misal: "hq", "branch", "billing"
    isDefault: boolean("is_default").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("org_address_organizationId_idx").on(table.organizationId),
    index("org_address_addressId_idx").on(table.addressId),
  ]
);

// --- DEFINISI RELASI ---

export const addressRelations = relations(address, ({ many }) => ({
  userAddresses: many(userAddress),
  organizationAddresses: many(organizationAddress),
}));

export const userAddressRelations = relations(userAddress, ({ one }) => ({
  user: one(user, {
    fields: [userAddress.userId],
    references: [user.id],
  }),
  address: one(address, {
    fields: [userAddress.addressId],
    references: [address.id],
  }),
}));

export const organizationAddressRelations = relations(organizationAddress, ({ one }) => ({
  organization: one(organization, {
    fields: [organizationAddress.organizationId],
    references: [organization.id],
  }),
  address: one(address, {
    fields: [organizationAddress.addressId],
    references: [address.id],
  }),
}));