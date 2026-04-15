import { relations } from "drizzle-orm";
import {
	account,
	apikey,
	invitation,
	member,
	organization,
	session,
	twoFactor,
	user,
	verification,
} from "./base";
import { customerContact, domainContactSet, userProfile } from "./user-profile";
import { domainSourceAccount, domainTldPolicy } from "./domain-routing";
import {
	organizationGatewayConfig,
	organizationPaymentMethod,
	paymentGateway,
	payments,
} from "./payments";
import { pointLedger, pointWallet } from "./points";
import { product, productPrice } from "./catalog";
import { productOrder, productOrderItem } from "./orders";
import {
	domain,
	domainNameserver,
	domainOrderItem,
	domainOrderItemNameserver,
	domainVerificationDocument,
} from "./domains";
import { productProcessLog, transactions } from "./transactions";

/**
 * =========================================================
 * BASE RELATIONS
 * =========================================================
 */
export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	members: many(member),
	invitations: many(invitation),
	twoFactors: many(twoFactor),

	profiles: many(userProfile, {
		relationName: "user_profile_owner",
	}),

	customerPayments: many(payments, {
		relationName: "payments_customer_user",
	}),
	actorPayments: many(payments, {
		relationName: "payments_actor_user",
	}),
	updatedPayments: many(payments, {
		relationName: "payments_updated_by",
	}),

	customerOrders: many(productOrder, {
		relationName: "product_order_customer_user",
	}),
	actorOrders: many(productOrder, {
		relationName: "product_order_actor_user",
	}),
	updatedOrders: many(productOrder, {
		relationName: "product_order_updated_by",
	}),

	customerDomains: many(domain, {
		relationName: "domain_customer_user",
	}),
	actorDomains: many(domain, {
		relationName: "domain_actor_user",
	}),
	updatedDomains: many(domain, {
		relationName: "domain_updated_by",
	}),

	customerDomainOrderItems: many(domainOrderItem, {
		relationName: "domain_order_item_customer_user",
	}),
	actorDomainOrderItems: many(domainOrderItem, {
		relationName: "domain_order_item_actor_user",
	}),

	actorDomainOrderItemNameservers: many(domainOrderItemNameserver, {
		relationName: "domain_order_item_ns_actor_user",
	}),
	actorDomainNameservers: many(domainNameserver, {
		relationName: "domain_ns_actor_user",
	}),

	pointLedgerActors: many(pointLedger, {
		relationName: "point_ledger_actor_user",
	}),
	transactionActors: many(transactions, {
		relationName: "transactions_actor_user",
	}),
	transactionCustomers: many(transactions, {
		relationName: "transactions_customer_user",
	}),
	processLogs: many(productProcessLog, {
		relationName: "product_process_log_actor_user",
	}),
	domainVerificationDocuments: many(domainVerificationDocument, {
		relationName: "domain_verification_document_customer_user",
	}),
	uploadedDomainVerificationDocuments: many(domainVerificationDocument, {
		relationName: "domain_verification_document_uploaded_by",
	}),
	updatedDomainVerificationDocuments: many(domainVerificationDocument, {
		relationName: "domain_verification_document_updated_by",
	}),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));

export const verificationRelations = relations(verification, () => ({}));

export const apikeyRelations = relations(apikey, () => ({}));

export const organizationRelations = relations(organization, ({ many }) => ({
	members: many(member),
	invitations: many(invitation),

	domainSourceAccounts: many(domainSourceAccount),
	domainTldPolicies: many(domainTldPolicy),

	gatewayConfigs: many(organizationGatewayConfig),
	paymentMethods: many(organizationPaymentMethod),

	pointWallets: many(pointWallet),
	pointLedgers: many(pointLedger),

	products: many(product),
	productPrices: many(productPrice),

	payments: many(payments),
	orders: many(productOrder),
	domains: many(domain),
	transactions: many(transactions),
	processLogs: many(productProcessLog),
	domainVerificationDocuments: many(domainVerificationDocument),
}));

export const memberRelations = relations(member, ({ one }) => ({
	organization: one(organization, {
		fields: [member.organizationId],
		references: [organization.id],
	}),
	user: one(user, {
		fields: [member.userId],
		references: [user.id],
	}),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
	organization: one(organization, {
		fields: [invitation.organizationId],
		references: [organization.id],
	}),
	inviter: one(user, {
		fields: [invitation.inviterId],
		references: [user.id],
	}),
}));

export const twoFactorRelations = relations(twoFactor, ({ one }) => ({
	user: one(user, {
		fields: [twoFactor.userId],
		references: [user.id],
	}),
}));

/**
 * =========================================================
 * PROFILE RELATIONS
 * =========================================================
 */
export const userProfileRelations = relations(userProfile, ({ one, many }) => ({
	user: one(user, {
		fields: [userProfile.userId],
		references: [user.id],
		relationName: "user_profile_owner",
	}),
	createdBy: one(user, {
		fields: [userProfile.createdByUserId],
		references: [user.id],
		relationName: "user_profile_created_by",
	}),
	updatedBy: one(user, {
		fields: [userProfile.updatedByUserId],
		references: [user.id],
		relationName: "user_profile_updated_by",
	}),
	contacts: many(customerContact),
	domainContactSets: many(domainContactSet),
}));

export const customerContactRelations = relations(customerContact, ({ one }) => ({
	userProfile: one(userProfile, {
		fields: [customerContact.userProfileId],
		references: [userProfile.id],
	}),
	createdBy: one(user, {
		fields: [customerContact.createdByUserId],
		references: [user.id],
		relationName: "customer_contact_created_by",
	}),
	updatedBy: one(user, {
		fields: [customerContact.updatedByUserId],
		references: [user.id],
		relationName: "customer_contact_updated_by",
	}),
}));

export const domainContactSetRelations = relations(
	domainContactSet,
	({ one, many }) => ({
		userProfile: one(userProfile, {
			fields: [domainContactSet.userProfileId],
			references: [userProfile.id],
		}),
		createdBy: one(user, {
			fields: [domainContactSet.createdByUserId],
			references: [user.id],
			relationName: "domain_contact_set_created_by",
		}),
		updatedBy: one(user, {
			fields: [domainContactSet.updatedByUserId],
			references: [user.id],
			relationName: "domain_contact_set_updated_by",
		}),
		tldPolicies: many(domainTldPolicy),
		domainOrderItems: many(domainOrderItem),
		domains: many(domain),
	}),
);

/**
 * =========================================================
 * ROUTING RELATIONS
 * =========================================================
 */
export const domainSourceAccountRelations = relations(
	domainSourceAccount,
	({ one, many }) => ({
		organization: one(organization, {
			fields: [domainSourceAccount.organizationId],
			references: [organization.id],
		}),
		createdBy: one(user, {
			fields: [domainSourceAccount.createdByUserId],
			references: [user.id],
			relationName: "domain_source_account_created_by",
		}),
		updatedBy: one(user, {
			fields: [domainSourceAccount.updatedByUserId],
			references: [user.id],
			relationName: "domain_source_account_updated_by",
		}),
		tldPolicies: many(domainTldPolicy),
		productPrices: many(productPrice),
		domainOrderItems: many(domainOrderItem),
		domains: many(domain),
	}),
);

export const domainTldPolicyRelations = relations(
	domainTldPolicy,
	({ one, many }) => ({
		organization: one(organization, {
			fields: [domainTldPolicy.organizationId],
			references: [organization.id],
		}),
		domainSourceAccount: one(domainSourceAccount, {
			fields: [domainTldPolicy.domainSourceAccountId],
			references: [domainSourceAccount.id],
		}),
		defaultDomainContactSet: one(domainContactSet, {
			fields: [domainTldPolicy.defaultDomainContactSetId],
			references: [domainContactSet.id],
		}),
		createdBy: one(user, {
			fields: [domainTldPolicy.createdByUserId],
			references: [user.id],
			relationName: "domain_tld_policy_created_by",
		}),
		updatedBy: one(user, {
			fields: [domainTldPolicy.updatedByUserId],
			references: [user.id],
			relationName: "domain_tld_policy_updated_by",
		}),
		productPrices: many(productPrice),
		domainOrderItems: many(domainOrderItem),
		domains: many(domain),
	}),
);

/**
 * =========================================================
 * PAYMENT RELATIONS
 * =========================================================
 */
export const paymentGatewayRelations = relations(paymentGateway, ({ many }) => ({
	configs: many(organizationGatewayConfig),
}));

export const organizationGatewayConfigRelations = relations(
	organizationGatewayConfig,
	({ one, many }) => ({
		organization: one(organization, {
			fields: [organizationGatewayConfig.organizationId],
			references: [organization.id],
		}),
		gateway: one(paymentGateway, {
			fields: [organizationGatewayConfig.gatewayId],
			references: [paymentGateway.id],
		}),
		createdBy: one(user, {
			fields: [organizationGatewayConfig.createdByUserId],
			references: [user.id],
			relationName: "organization_gateway_config_created_by",
		}),
		updatedBy: one(user, {
			fields: [organizationGatewayConfig.updatedByUserId],
			references: [user.id],
			relationName: "organization_gateway_config_updated_by",
		}),
		paymentMethods: many(organizationPaymentMethod),
		payments: many(payments),
	}),
);

export const organizationPaymentMethodRelations = relations(
	organizationPaymentMethod,
	({ one, many }) => ({
		organization: one(organization, {
			fields: [organizationPaymentMethod.organizationId],
			references: [organization.id],
		}),
		gatewayConfig: one(organizationGatewayConfig, {
			fields: [organizationPaymentMethod.gatewayConfigId],
			references: [organizationGatewayConfig.id],
		}),
		createdBy: one(user, {
			fields: [organizationPaymentMethod.createdByUserId],
			references: [user.id],
			relationName: "organization_payment_method_created_by",
		}),
		updatedBy: one(user, {
			fields: [organizationPaymentMethod.updatedByUserId],
			references: [user.id],
			relationName: "organization_payment_method_updated_by",
		}),
		payments: many(payments),
	}),
);

export const paymentsRelations = relations(payments, ({ one, many }) => ({
	organization: one(organization, {
		fields: [payments.organizationId],
		references: [organization.id],
	}),
	customerUser: one(user, {
		fields: [payments.userId],
		references: [user.id],
		relationName: "payments_customer_user",
	}),
	paymentMethod: one(organizationPaymentMethod, {
		fields: [payments.organizationPaymentMethodId],
		references: [organizationPaymentMethod.id],
	}),
	gatewayConfig: one(organizationGatewayConfig, {
		fields: [payments.gatewayConfigId],
		references: [organizationGatewayConfig.id],
	}),
	actorUser: one(user, {
		fields: [payments.actorUserId],
		references: [user.id],
		relationName: "payments_actor_user",
	}),
	updatedBy: one(user, {
		fields: [payments.updatedByUserId],
		references: [user.id],
		relationName: "payments_updated_by",
	}),
	transactions: many(transactions),
	verificationDocuments: many(domainVerificationDocument),
}));

/**
 * =========================================================
 * POINT RELATIONS
 * =========================================================
 */
export const pointWalletRelations = relations(pointWallet, ({ one, many }) => ({
	organization: one(organization, {
		fields: [pointWallet.organizationId],
		references: [organization.id],
	}),
	ledgers: many(pointLedger),
}));

export const pointLedgerRelations = relations(pointLedger, ({ one, many }) => ({
	wallet: one(pointWallet, {
		fields: [pointLedger.walletId],
		references: [pointWallet.id],
	}),
	organization: one(organization, {
		fields: [pointLedger.organizationId],
		references: [organization.id],
	}),
	actorUser: one(user, {
		fields: [pointLedger.actorUserId],
		references: [user.id],
		relationName: "point_ledger_actor_user",
	}),
	transactions: many(transactions),
}));

/**
 * =========================================================
 * CATALOG RELATIONS
 * =========================================================
 */
export const productRelations = relations(product, ({ one, many }) => ({
	organization: one(organization, {
		fields: [product.organizationId],
		references: [organization.id],
	}),
	createdBy: one(user, {
		fields: [product.createdByUserId],
		references: [user.id],
		relationName: "product_created_by",
	}),
	updatedBy: one(user, {
		fields: [product.updatedByUserId],
		references: [user.id],
		relationName: "product_updated_by",
	}),
	prices: many(productPrice),
	orderItems: many(productOrderItem),
}));

export const productPriceRelations = relations(productPrice, ({ one, many }) => ({
	organization: one(organization, {
		fields: [productPrice.organizationId],
		references: [organization.id],
	}),
	product: one(product, {
		fields: [productPrice.productId],
		references: [product.id],
	}),
	domainSourceAccount: one(domainSourceAccount, {
		fields: [productPrice.domainSourceAccountId],
		references: [domainSourceAccount.id],
	}),
	domainTldPolicy: one(domainTldPolicy, {
		fields: [productPrice.domainTldPolicyId],
		references: [domainTldPolicy.id],
	}),
	createdBy: one(user, {
		fields: [productPrice.createdByUserId],
		references: [user.id],
		relationName: "product_price_created_by",
	}),
	updatedBy: one(user, {
		fields: [productPrice.updatedByUserId],
		references: [user.id],
		relationName: "product_price_updated_by",
	}),
	orderItems: many(productOrderItem),
}));

/**
 * =========================================================
 * ORDER RELATIONS
 * =========================================================
 */
export const productOrderRelations = relations(productOrder, ({ one, many }) => ({
	organization: one(organization, {
		fields: [productOrder.organizationId],
		references: [organization.id],
	}),
	customerUser: one(user, {
		fields: [productOrder.customerUserId],
		references: [user.id],
		relationName: "product_order_customer_user",
	}),
	actorUser: one(user, {
		fields: [productOrder.actorUserId],
		references: [user.id],
		relationName: "product_order_actor_user",
	}),
	updatedBy: one(user, {
		fields: [productOrder.updatedByUserId],
		references: [user.id],
		relationName: "product_order_updated_by",
	}),
	items: many(productOrderItem),
	transactions: many(transactions),
}));

export const productOrderItemRelations = relations(
	productOrderItem,
	({ one, many }) => ({
		order: one(productOrder, {
			fields: [productOrderItem.orderId],
			references: [productOrder.id],
		}),
		product: one(product, {
			fields: [productOrderItem.productId],
			references: [product.id],
		}),
		productPrice: one(productPrice, {
			fields: [productOrderItem.productPriceId],
			references: [productPrice.id],
		}),
		domainOrderItems: many(domainOrderItem),
		transactions: many(transactions),
	}),
);

/**
 * =========================================================
 * DOMAIN RELATIONS
 * =========================================================
 */
export const domainOrderItemRelations = relations(
	domainOrderItem,
	({ one, many }) => ({
		productOrderItem: one(productOrderItem, {
			fields: [domainOrderItem.productOrderItemId],
			references: [productOrderItem.id],
		}),
		customerUser: one(user, {
			fields: [domainOrderItem.customerUserId],
			references: [user.id],
			relationName: "domain_order_item_customer_user",
		}),
		domainSourceAccount: one(domainSourceAccount, {
			fields: [domainOrderItem.domainSourceAccountId],
			references: [domainSourceAccount.id],
		}),
		domainTldPolicy: one(domainTldPolicy, {
			fields: [domainOrderItem.domainTldPolicyId],
			references: [domainTldPolicy.id],
		}),
		domainContactSet: one(domainContactSet, {
			fields: [domainOrderItem.domainContactSetId],
			references: [domainContactSet.id],
		}),
		actorUser: one(user, {
			fields: [domainOrderItem.actorUserId],
			references: [user.id],
			relationName: "domain_order_item_actor_user",
		}),
		nameservers: many(domainOrderItemNameserver),
	}),
);

export const domainOrderItemNameserverRelations = relations(
	domainOrderItemNameserver,
	({ one }) => ({
		domainOrderItem: one(domainOrderItem, {
			fields: [domainOrderItemNameserver.domainOrderItemId],
			references: [domainOrderItem.id],
		}),
		actorUser: one(user, {
			fields: [domainOrderItemNameserver.actorUserId],
			references: [user.id],
			relationName: "domain_order_item_ns_actor_user",
		}),
	}),
);

export const domainRelations = relations(domain, ({ one, many }) => ({
	organization: one(organization, {
		fields: [domain.organizationId],
		references: [organization.id],
	}),
	customerUser: one(user, {
		fields: [domain.customerUserId],
		references: [user.id],
		relationName: "domain_customer_user",
	}),
	domainSourceAccount: one(domainSourceAccount, {
		fields: [domain.domainSourceAccountId],
		references: [domainSourceAccount.id],
	}),
	domainTldPolicy: one(domainTldPolicy, {
		fields: [domain.domainTldPolicyId],
		references: [domainTldPolicy.id],
	}),
	domainContactSet: one(domainContactSet, {
		fields: [domain.domainContactSetId],
		references: [domainContactSet.id],
	}),
	actorUser: one(user, {
		fields: [domain.actorUserId],
		references: [user.id],
		relationName: "domain_actor_user",
	}),
	updatedBy: one(user, {
		fields: [domain.updatedByUserId],
		references: [user.id],
		relationName: "domain_updated_by",
	}),
	nameservers: many(domainNameserver),
	transactions: many(transactions),
}));

export const domainNameserverRelations = relations(domainNameserver, ({ one }) => ({
	domain: one(domain, {
		fields: [domainNameserver.domainId],
		references: [domain.id],
	}),
	actorUser: one(user, {
		fields: [domainNameserver.actorUserId],
		references: [user.id],
		relationName: "domain_ns_actor_user",
	}),
}));

/**
 * =========================================================
 * TRANSACTION RELATIONS
 * =========================================================
 */
export const transactionsRelations = relations(transactions, ({ one }) => ({
	organization: one(organization, {
		fields: [transactions.organizationId],
		references: [organization.id],
	}),
	customerUser: one(user, {
		fields: [transactions.customerUserId],
		references: [user.id],
		relationName: "transactions_customer_user",
	}),
	productOrder: one(productOrder, {
		fields: [transactions.productOrderId],
		references: [productOrder.id],
	}),
	productOrderItem: one(productOrderItem, {
		fields: [transactions.productOrderItemId],
		references: [productOrderItem.id],
	}),
	payment: one(payments, {
		fields: [transactions.paymentId],
		references: [payments.id],
	}),
	pointLedger: one(pointLedger, {
		fields: [transactions.pointLedgerId],
		references: [pointLedger.id],
	}),
	domain: one(domain, {
		fields: [transactions.domainId],
		references: [domain.id],
	}),
	actorUser: one(user, {
		fields: [transactions.actorUserId],
		references: [user.id],
		relationName: "transactions_actor_user",
	}),
}));

export const productProcessLogRelations = relations(
	productProcessLog,
	({ one }) => ({
		organization: one(organization, {
			fields: [productProcessLog.organizationId],
			references: [organization.id],
		}),
		actorUser: one(user, {
			fields: [productProcessLog.actorUserId],
			references: [user.id],
			relationName: "product_process_log_actor_user",
		}),
	}),
);


export const domainVerificationDocumentRelations = relations(
	domainVerificationDocument,
	({ one }) => ({
		domain: one(domain, {
			fields: [domainVerificationDocument.domainId],
			references: [domain.id],
		}),
		organization: one(organization, {
			fields: [domainVerificationDocument.organizationId],
			references: [organization.id],
		}),
		customerUser: one(user, {
			fields: [domainVerificationDocument.customerUserId],
			references: [user.id],
			relationName: "domain_verification_document_customer_user",
		}),
		uploadedBy: one(user, {
			fields: [domainVerificationDocument.uploadedByUserId],
			references: [user.id],
			relationName: "domain_verification_document_uploaded_by",
		}),
		updatedBy: one(user, {
			fields: [domainVerificationDocument.updatedByUserId],
			references: [user.id],
			relationName: "domain_verification_document_updated_by",
		}),
	}),
);
