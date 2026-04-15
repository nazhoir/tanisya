import type { RouterClient } from "@orpc/server";

import { protectedProcedure, publicProcedure } from "../index";
import { domainRouter } from "./domain";
import { paymentRouter } from "./payments";
import { pointsRouter } from "./points";

export const appRouter = {
	healthCheck: publicProcedure.handler(() => "OK"),
	privateData: protectedProcedure.handler(({ context }) => ({
		message: "This is private",
		user: context.session?.user ?? null,
	})),
	domain: domainRouter,
	points: pointsRouter,
	payment: paymentRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
