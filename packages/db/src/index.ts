import { drizzle } from "drizzle-orm/node-postgres";
import * as authSchema from "./schema/auth";
import * as appSchema from "./schema/index";

export const schema = { ...authSchema, ...appSchema };

export const db = drizzle(process.env.DATABASE_URL!, { schema });

export type DB = typeof db;

export * from "./schema/auth";
export * from "./schema/index";
export * from "./queries/orders";
export * from "./queries/products";
export * from "./queries/organizations";