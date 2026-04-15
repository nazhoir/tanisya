import { domainCatalogRouter } from "./catalog";
import { domainConfigRouter } from "./config";
import { domainContactRouter } from "./contacts";
import { domainManagementRouter } from "./management";
import { domainOrderRouter } from "./orders";
import { domainProfileRouter } from "./profile";
import { domainVerificationRouter } from "./verification";

export const domainRouter = {
	catalog: domainCatalogRouter,
	profile: domainProfileRouter,
	contact: domainContactRouter,
	config: domainConfigRouter,
	order: domainOrderRouter,
	manage: domainManagementRouter,
	verification: domainVerificationRouter,
};
