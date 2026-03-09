import { o } from "../index";
import { orderRouter } from "./orders";
import { productRouter } from "./products";
import { organizationRouter } from "./organizations";

export const appRouter = o.router({
  orders: orderRouter,
  products: productRouter,
  organizations: organizationRouter,
});

export type AppRouter = typeof appRouter;