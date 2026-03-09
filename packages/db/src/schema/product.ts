import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
  uniqueIndex,
  date,
} from "drizzle-orm/pg-core";

import { user, organization, member, invitation } from "./auth";

// ====================================
// ENUMS
// ====================================

export const supplierTypeEnum = pgEnum("supplier_type", [
  "registrar",
  "hosting_provider",
  "vps_provider",
  "distributor",
  "manufacturer",
]);

export const userContactLabelEnum = pgEnum("user_contact_label", [
  "Default",
  "Admin",
  "Technical",
  "Billing",
  "Registrant",
]);

export const productTypeEnum = pgEnum("product_type", [
  "domain",
  "hosting",
  "vps",
  "digital",
  "physical",
]);

export const recurringIntervalEnum = pgEnum("recurring_interval", [
  "once",
  "monthly",
  "yearly",
]);

export const cartStatusEnum = pgEnum("cart_status", [
  "active",
  "converted",
  "abandoned",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "draft",
  "pending_payment",
  "awaiting_verification",
  "paid",
  "cancelled",
  "expired",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "issued",
  "paid",
  "cancelled",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "bank_transfer",
  "stripe",
  "midtrans",
  "xendit",
  "manual",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "waiting_confirmation",
  "paid",
  "failed",
  "expired",
  "refunded",
]);

export const refundStatusEnum = pgEnum("refund_status", [
  "requested",
  "approved",
  "rejected",
  "processed",
]);

export const domainContactTypeEnum = pgEnum("domain_contact_type", [
  "registrant",
  "billing",
  "admin",
  "tech",
]);

export const domainVerificationStatusEnum = pgEnum(
  "domain_verification_status",
  ["waiting", "verifying", "document_validating", "active"],
);

export const domainStatusEnum = pgEnum("domain_status", [
  "Live",
  "Unpaid",
  "Pending",
  "Expired",
  "PendingDeleteRestorable",
  "PendingTransfer",
  "PendingRestore",
  "Suspended",
  "Transferred",
  "Rejected",
]);

export const dnsRecordTypeEnum = pgEnum("dns_record_type", [
  "A",
  "AAAA",
  "MXE",
  "MX",
  "CNAME",
  "SPF",
]);

export const domainPollActionStatusEnum = pgEnum("domain_poll_action_status", [
  "pending",
  "complete",
]);

export const dcvMethodEnum = pgEnum("dcv_method", [
  "dns",
  "http",
  "https",
  "email",
]);

export const sslStatusEnum = pgEnum("ssl_status", [
  "pending",
  "active",
  "expired",
  "cancelled",
  "reissuing",
]);

export const objectStorageStatusEnum = pgEnum("object_storage_status", [
  "active",
  "suspended",
  "terminated",
]);

export const bareMetalCycleEnum = pgEnum("bare_metal_cycle", [
  "monthly",
  "quarterly",
  "annually",
]);

export const bareMetalStatusEnum = pgEnum("bare_metal_status", [
  "active",
  "suspended",
  "terminated",
  "building",
  "rebuilding",
]);

export const bareMetalStateEnum = pgEnum("bare_metal_state", [
  "on",
  "off",
  "reset",
]);

export const documentVerificationStatusEnum = pgEnum(
  "document_verification_status",
  ["pending", "approved", "rejected"],
);

// ====================================
// TAX SYSTEM
// ====================================

export const taxRate = pgTable(
  "tax_rate",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    rate: integer("rate").notNull(),
    countryCode: text("country_code").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("tax_rate_countryCode_idx").on(t.countryCode),
    index("tax_rate_isActive_idx").on(t.isActive),
  ],
);

export const productTaxCategory = pgTable("product_tax_category", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ====================================
// SUPPLIER
// ====================================

export const supplier = pgTable(
  "supplier",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    type: supplierTypeEnum("type").notNull(),
    contactName: text("contact_name").notNull(),
    contactEmail: text("contact_email").notNull(),
    contactPhone: text("contact_phone").notNull(),
    website: text("website").notNull(),
    metadata: jsonb("metadata").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("supplier_type_idx").on(t.type),
    index("supplier_isActive_idx").on(t.isActive),
  ],
);

// ====================================
// USER CONTACT
// ====================================

export const userContact = pgTable(
  "user_contact",
  {
    id: text("id").primaryKey(),
    externalId: integer("external_id").notNull(),
    contactId: text("contact_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    label: userContactLabelEnum("label").notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    organization: text("organization").notNull(),
    street1: text("street1").notNull(),
    street2: text("street2"),
    city: text("city").notNull(),
    state: text("state").notNull(),
    countryCode: text("country_code").notNull(),
    postalCode: text("postal_code").notNull(),
    voice: text("voice").notNull(),
    fax: text("fax"),
    reference: text("reference"),
    status: integer("status").notNull(),
    statusLabel: text("status_label").notNull(),
    pendingChange: jsonb("pending_change"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("user_contact_userId_idx").on(t.userId),
    uniqueIndex("user_contact_contactId_uidx").on(t.contactId),
  ],
);

// ====================================
// PRODUCT
// ====================================

export const product = pgTable(
  "product",
  {
    id: text("id").primaryKey(),
    supplierId: text("supplier_id")
      .notNull()
      .references(() => supplier.id),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    type: productTypeEnum("type").notNull(),
    description: text("description").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    isPremium: boolean("is_premium").notNull().default(false),
    requiresVerification: boolean("requires_verification")
      .notNull()
      .default(false),
    stock: integer("stock"),
    taxCategoryId: text("tax_category_id")
      .notNull()
      .references(() => productTaxCategory.id),
    metadata: jsonb("metadata").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    uniqueIndex("product_slug_uidx").on(t.slug),
    index("product_supplierId_idx").on(t.supplierId),
    index("product_type_idx").on(t.type),
    index("product_isActive_idx").on(t.isActive),
  ],
);

// ====================================
// PRODUCT PRICE
// ====================================

export const productPrice = pgTable(
  "product_price",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => product.id),
    costPrice: integer("cost_price").notNull(),
    basePrice: integer("base_price").notNull(),
    currency: text("currency").notNull().default("IDR"),
    recurringInterval: recurringIntervalEnum("recurring_interval").notNull(),
    isPromo: boolean("is_promo").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("product_price_productId_idx").on(t.productId),
    index("product_price_recurringInterval_idx").on(t.recurringInterval),
    index("product_price_isPromo_idx").on(t.isPromo),
  ],
);

// ====================================
// CART
// ====================================

export const cart = pgTable("cart", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id),
  createdByUserId: text("created_by_user_id")
    .notNull()
    .references(() => user.id),
  status: cartStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const cartItem = pgTable("cart_item", {
  id: text("id").primaryKey(),
  cartId: text("cart_id")
    .notNull()
    .references(() => cart.id),
  productId: text("product_id")
    .notNull()
    .references(() => product.id),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(),
  discountAmount: integer("discount_amount").notNull(),
  totalAmount: integer("total_amount").notNull(),
  metadata: jsonb("metadata").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ====================================
// INVOICE
// ====================================

export const invoice = pgTable(
  "invoice",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id),
    invoiceNumber: text("invoice_number").notNull(),
    status: invoiceStatusEnum("status").notNull().default("draft"),
    subtotal: integer("subtotal").notNull(),
    taxTotal: integer("tax_total").notNull(),
    discountTotal: integer("discount_total").notNull(),
    grandTotal: integer("grand_total").notNull(),
    currency: text("currency").notNull(),
    dueDate: timestamp("due_date").notNull(),
    issuedAt: timestamp("issued_at"),
    paidAt: timestamp("paid_at"),
    taxBreakdown: jsonb("tax_breakdown"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("invoice_organizationId_idx").on(t.organizationId),
    uniqueIndex("invoice_invoiceNumber_uidx").on(t.invoiceNumber),
    index("invoice_status_idx").on(t.status),
  ],
);

// ====================================
// ORDER
// ====================================

export const order = pgTable(
  "order",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id),
    orderedByUserId: text("ordered_by_user_id")
      .notNull()
      .references(() => user.id),
    invoiceId: text("invoice_id")
      .notNull()
      .references(() => invoice.id),
    status: orderStatusEnum("status").notNull().default("draft"),
    subtotal: integer("subtotal").notNull(),
    discountTotal: integer("discount_total").notNull(),
    taxTotal: integer("tax_total").notNull(),
    grandTotal: integer("grand_total").notNull(),
    currency: text("currency").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("order_organizationId_idx").on(t.organizationId),
    index("order_status_idx").on(t.status),
    index("order_createdAt_idx").on(t.createdAt),
  ],
);

// ====================================
// ORDER ITEM
// ====================================

export const orderItem = pgTable(
  "order_item",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => order.id),
    productId: text("product_id")
      .notNull()
      .references(() => product.id),
    supplierId: text("supplier_id")
      .notNull()
      .references(() => supplier.id),
    productNameSnapshot: text("product_name_snapshot").notNull(),
    productTypeSnapshot: productTypeEnum("product_type_snapshot").notNull(),
    supplierNameSnapshot: text("supplier_name_snapshot").notNull(),
    quantity: integer("quantity").notNull(),
    costPriceSnapshot: integer("cost_price_snapshot").notNull(),
    unitPrice: integer("unit_price").notNull(),
    discountAmount: integer("discount_amount").notNull(),
    taxRateSnapshot: integer("tax_rate_snapshot").notNull(),
    taxAmount: integer("tax_amount").notNull(),
    totalAmount: integer("total_amount").notNull(),
    metadata: jsonb("metadata").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("order_item_orderId_idx").on(t.orderId)],
);

// ====================================
// PAYMENT
// ====================================

export const payment = pgTable(
  "payment",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => order.id),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id),
    invoiceId: text("invoice_id")
      .notNull()
      .references(() => invoice.id),
    method: paymentMethodEnum("method").notNull(),
    status: paymentStatusEnum("status").notNull().default("pending"),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull(),
    externalReference: text("external_reference"),
    gatewayResponse: jsonb("gateway_response"),
    paidAt: timestamp("paid_at"),
    verifiedByAdminId: text("verified_by_admin_id"),
    verifiedAt: timestamp("verified_at"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("payment_organizationId_idx").on(t.organizationId),
    index("payment_status_idx").on(t.status),
    index("payment_externalReference_idx").on(t.externalReference),
  ],
);

// ====================================
// BANK ACCOUNT
// ====================================

export const bankAccount = pgTable("bank_account", {
  id: text("id").primaryKey(),
  bankName: text("bank_name").notNull(),
  accountNumber: text("account_number").notNull(),
  accountHolder: text("account_holder").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ====================================
// REFUND
// ====================================

export const refund = pgTable("refund", {
  id: text("id").primaryKey(),
  paymentId: text("payment_id")
    .notNull()
    .references(() => payment.id),
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(),
  status: refundStatusEnum("status").notNull().default("requested"),
  processedByAdminId: text("processed_by_admin_id"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ====================================
// DOMAIN CONTACT
// ====================================

export const domainContact = pgTable("domain_contact", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id),
  type: domainContactTypeEnum("type").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  countryCode: text("country_code").notNull(),
  postalCode: text("postal_code").notNull(),
  fax: text("fax"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ====================================
// DOMAIN REGISTRATION
// ====================================

export const domainRegistration = pgTable(
  "domain_registration",
  {
    id: text("id").primaryKey(),
    orderItemId: text("order_item_id")
      .notNull()
      .references(() => orderItem.id, { onDelete: "cascade" }),
    supplierId: text("supplier_id")
      .notNull()
      .references(() => supplier.id),
    domainName: text("domain_name").notNull(),
    tld: text("tld").notNull(),
    isPremium: boolean("is_premium").notNull().default(false),
    requiresDocumentVerification: boolean("requires_document_verification")
      .notNull()
      .default(false),
    providerCustomerId: integer("provider_customer_id").notNull(),
    registrantContactId: integer("registrant_contact_id"),
    billingContactId: integer("billing_contact_id"),
    adminContactId: integer("admin_contact_id"),
    techContactId: integer("tech_contact_id"),
    years: integer("years").notNull(),
    nameServers: jsonb("name_servers").notNull(),
    privacyProtection: boolean("privacy_protection").notNull().default(false),
    authCode: text("auth_code"),
    providerDomainId: integer("provider_domain_id"),
    invoiceOption: text("invoice_option"),
    extra: jsonb("extra"),
    verificationStatus: domainVerificationStatusEnum(
      "verification_status",
    ).notNull(),
    status: domainStatusEnum("status").notNull(),
    isLocked: boolean("is_locked").notNull().default(false),
    isRegistrarLocked: boolean("is_registrar_locked").notNull().default(false),
    dnssecEnabled: boolean("dnssec_enabled").notNull().default(false),
    creationDate: date("creation_date"),
    expiryDate: date("expiry_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    uniqueIndex("domain_registration_domainName_uidx").on(t.domainName),
    index("domain_registration_expiryDate_idx").on(t.expiryDate),
    index("domain_registration_status_idx").on(t.status),
    index("domain_registration_supplierId_idx").on(t.supplierId),
    index("domain_registration_verificationStatus_idx").on(
      t.verificationStatus,
    ),
    index("domain_registration_providerDomainId_idx").on(t.providerDomainId),
  ],
);

// ====================================
// DOMAIN DNS RECORD
// ====================================

export const domainDnsRecord = pgTable(
  "domain_dns_record",
  {
    id: text("id").primaryKey(),
    domainRegistrationId: text("domain_registration_id")
      .notNull()
      .references(() => domainRegistration.id),
    name: text("name").notNull(),
    type: dnsRecordTypeEnum("type").notNull(),
    content: text("content").notNull(),
    ttl: integer("ttl").notNull().default(3600),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("domain_dns_record_domainRegistrationId_idx").on(
      t.domainRegistrationId,
    ),
    index("domain_dns_record_type_idx").on(t.type),
  ],
);

// ====================================
// DOMAIN NAMESERVER
// ====================================

export const domainNameserver = pgTable(
  "domain_nameserver",
  {
    id: text("id").primaryKey(),
    domainRegistrationId: text("domain_registration_id")
      .notNull()
      .references(() => domainRegistration.id),
    providerHostId: integer("provider_host_id"),
    hostname: text("hostname").notNull(),
    ipAddress: text("ip_address").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("domain_nameserver_domainRegistrationId_idx").on(
      t.domainRegistrationId,
    ),
  ],
);

// ====================================
// DOMAIN FORWARDING
// ====================================

export const domainForwarding = pgTable(
  "domain_forwarding",
  {
    id: text("id").primaryKey(),
    domainRegistrationId: text("domain_registration_id")
      .notNull()
      .references(() => domainRegistration.id),
    providerForwardingId: integer("provider_forwarding_id"),
    from: text("from").notNull(),
    to: text("to").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("domain_forwarding_domainRegistrationId_idx").on(
      t.domainRegistrationId,
    ),
  ],
);

// ====================================
// DOMAIN DNSSEC
// ====================================

export const domainDnssec = pgTable(
  "domain_dnssec",
  {
    id: text("id").primaryKey(),
    domainRegistrationId: text("domain_registration_id")
      .notNull()
      .references(() => domainRegistration.id),
    providerDnssecId: integer("provider_dnssec_id"),
    keyTag: integer("key_tag").notNull(),
    algorithm: integer("algorithm").notNull(),
    digestType: integer("digest_type").notNull(),
    digest: text("digest").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("domain_dnssec_domainRegistrationId_idx").on(t.domainRegistrationId),
  ],
);

// ====================================
// DOMAIN DOCUMENT VERIFICATION
// ====================================

export const domainDocumentVerification = pgTable(
  "domain_document_verification",
  {
    id: text("id").primaryKey(),
    domainRegistrationId: text("domain_registration_id")
      .notNull()
      .references(() => domainRegistration.id),
    documentType: text("document_type").notNull(),
    documentUrl: text("document_url").notNull(),
    status: documentVerificationStatusEnum("status")
      .notNull()
      .default("pending"),
    reviewedByAdminId: text("reviewed_by_admin_id"),
    reviewedAt: timestamp("reviewed_at"),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("domain_doc_verification_status_idx").on(t.status),
    index("domain_doc_verification_domainRegistrationId_idx").on(
      t.domainRegistrationId,
    ),
  ],
);

// ====================================
// WHOIS PROTECTION
// ====================================

export const whoisProtection = pgTable("whois_protection", {
  id: text("id").primaryKey(),
  domainRegistrationId: text("domain_registration_id")
    .notNull()
    .references(() => domainRegistration.id)
    .unique(),
  isPurchased: boolean("is_purchased").notNull().default(false),
  isEnabled: boolean("is_enabled").notNull().default(false),
  purchasedAt: timestamp("purchased_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// ====================================
// DOMAIN POLL
// ====================================

export const domainPoll = pgTable(
  "domain_poll",
  {
    id: text("id").primaryKey(),
    domainRegistrationId: text("domain_registration_id").references(
      () => domainRegistration.id,
    ),
    providerPollId: integer("provider_poll_id").notNull(),
    actionStatus: domainPollActionStatusEnum("action_status").notNull(),
    message: text("message"),
    acknowledgedAt: timestamp("acknowledged_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("domain_poll_actionStatus_idx").on(t.actionStatus),
    uniqueIndex("domain_poll_providerPollId_uidx").on(t.providerPollId),
  ],
);

// ====================================
// SSL ORDER
// ====================================

export const sslOrder = pgTable(
  "ssl_order",
  {
    id: text("id").primaryKey(),
    orderItemId: text("order_item_id")
      .notNull()
      .references(() => orderItem.id),
    supplierId: text("supplier_id")
      .notNull()
      .references(() => supplier.id),
    providerSslOrderId: integer("provider_ssl_order_id"),
    sslProductId: integer("ssl_product_id").notNull(),
    customerId: integer("customer_id").notNull(),
    domain: text("domain").notNull(),
    period: integer("period").notNull(),
    dcvMethod: dcvMethodEnum("dcv_method").notNull(),
    dcvEmail: text("dcv_email"),
    csrCode: text("csr_code").notNull(),
    status: sslStatusEnum("status").notNull().default("pending"),
    certificateIssuedAt: timestamp("certificate_issued_at"),
    certificateExpiresAt: timestamp("certificate_expires_at"),
    downloadUrl: text("download_url"),
    adminContact: jsonb("admin_contact").notNull(),
    techContact: jsonb("tech_contact").notNull(),
    orgInfo: jsonb("org_info"),
    gatewayResponse: jsonb("gateway_response"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("ssl_order_orderItemId_idx").on(t.orderItemId),
    index("ssl_order_providerSslOrderId_idx").on(t.providerSslOrderId),
    index("ssl_order_status_idx").on(t.status),
  ],
);

// ====================================
// OBJECT STORAGE ORDER
// ====================================

export const objectStorageOrder = pgTable(
  "object_storage_order",
  {
    id: text("id").primaryKey(),
    orderItemId: text("order_item_id")
      .notNull()
      .references(() => orderItem.id),
    supplierId: text("supplier_id")
      .notNull()
      .references(() => supplier.id),
    providerObjectStorageId: integer("provider_object_storage_id"),
    customerId: integer("customer_id").notNull(),
    name: text("name").notNull(),
    sizeGb: integer("size_gb").notNull(),
    billingCycle: integer("billing_cycle").notNull(),
    status: objectStorageStatusEnum("status").notNull().default("active"),
    suspendReason: text("suspend_reason"),
    renewedAt: timestamp("renewed_at"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("object_storage_order_orderItemId_idx").on(t.orderItemId),
    index("object_storage_order_providerObjectStorageId_idx").on(
      t.providerObjectStorageId,
    ),
    index("object_storage_order_status_idx").on(t.status),
  ],
);

// ====================================
// OBJECT STORAGE KEY
// ====================================

export const objectStorageKey = pgTable(
  "object_storage_key",
  {
    id: text("id").primaryKey(),
    objectStorageOrderId: text("object_storage_order_id")
      .notNull()
      .references(() => objectStorageOrder.id),
    providerKeyId: integer("provider_key_id"),
    label: text("label"),
    accessKey: text("access_key"),
    secretKey: text("secret_key"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("object_storage_key_objectStorageOrderId_idx").on(
      t.objectStorageOrderId,
    ),
  ],
);

// ====================================
// OBJECT STORAGE BUCKET
// ====================================

export const objectStorageBucket = pgTable(
  "object_storage_bucket",
  {
    id: text("id").primaryKey(),
    objectStorageOrderId: text("object_storage_order_id")
      .notNull()
      .references(() => objectStorageOrder.id),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("object_storage_bucket_objectStorageOrderId_idx").on(
      t.objectStorageOrderId,
    ),
  ],
);

// ====================================
// BARE METAL ORDER
// ====================================

export const bareMetalOrder = pgTable(
  "bare_metal_order",
  {
    id: text("id").primaryKey(),
    orderItemId: text("order_item_id")
      .notNull()
      .references(() => orderItem.id),
    supplierId: text("supplier_id")
      .notNull()
      .references(() => supplier.id),
    providerBareMetalOrderId: integer("provider_bare_metal_order_id"),
    customerId: integer("customer_id").notNull(),
    bareMetalProductId: integer("bare_metal_product_id").notNull(),
    name: text("name").notNull(),
    os: text("os").notNull(),
    cycle: bareMetalCycleEnum("cycle").notNull(),
    keypair: text("keypair").notNull(),
    status: bareMetalStatusEnum("status").notNull().default("building"),
    suspendReason: text("suspend_reason"),
    state: bareMetalStateEnum("state").notNull(),
    ipAddress: text("ip_address"),
    renewedAt: timestamp("renewed_at"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("bare_metal_order_orderItemId_idx").on(t.orderItemId),
    index("bare_metal_order_providerBareMetalOrderId_idx").on(
      t.providerBareMetalOrderId,
    ),
    index("bare_metal_order_status_idx").on(t.status),
  ],
);

// ====================================
// AUDIT LOG
// ====================================

export const auditLog = pgTable(
  "audit_log",
  {
    id: text("id").primaryKey(),
    actorUserId: text("actor_user_id").notNull(),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    metadata: jsonb("metadata").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("audit_log_actorUserId_idx").on(t.actorUserId),
    index("audit_log_entityType_idx").on(t.entityType),
    index("audit_log_entityId_idx").on(t.entityId),
    index("audit_log_createdAt_idx").on(t.createdAt),
  ],
);

// ====================================
// RELATIONS
// ====================================

export const taxRateRelations = relations(taxRate, ({ many }) => ({
  orderItems: many(orderItem),
}));

export const productTaxCategoryRelations = relations(
  productTaxCategory,
  ({ many }) => ({
    products: many(product),
  }),
);

export const supplierRelations = relations(supplier, ({ many }) => ({
  products: many(product),
  domainRegistrations: many(domainRegistration),
  sslOrders: many(sslOrder),
  objectStorageOrders: many(objectStorageOrder),
  bareMetalOrders: many(bareMetalOrder),
}));

export const productRelations = relations(product, ({ one, many }) => ({
  supplier: one(supplier, {
    fields: [product.supplierId],
    references: [supplier.id],
  }),
  taxCategory: one(productTaxCategory, {
    fields: [product.taxCategoryId],
    references: [productTaxCategory.id],
  }),
  productPrices: many(productPrice),
}));

export const productPriceRelations = relations(productPrice, ({ one }) => ({
  product: one(product, {
    fields: [productPrice.productId],
    references: [product.id],
  }),
}));

export const userContactRelations = relations(userContact, ({ one }) => ({
  user: one(user, {
    fields: [userContact.userId],
    references: [user.id],
  }),
}));

export const cartRelations = relations(cart, ({ one, many }) => ({
  organization: one(organization, {
    fields: [cart.organizationId],
    references: [organization.id],
  }),
  createdByUser: one(user, {
    fields: [cart.createdByUserId],
    references: [user.id],
  }),
  cartItems: many(cartItem),
}));

export const cartItemRelations = relations(cartItem, ({ one }) => ({
  cart: one(cart, {
    fields: [cartItem.cartId],
    references: [cart.id],
  }),
  product: one(product, {
    fields: [cartItem.productId],
    references: [product.id],
  }),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
  invitations: many(invitation),
  orders: many(order),
  invoices: many(invoice),
  payments: many(payment),
  carts: many(cart),
  domainContacts: many(domainContact),
}));

export const invoiceRelations = relations(invoice, ({ one, many }) => ({
  organization: one(organization, {
    fields: [invoice.organizationId],
    references: [organization.id],
  }),
  payments: many(payment),
  orders: many(order),
}));

export const orderRelations = relations(order, ({ one, many }) => ({
  organization: one(organization, {
    fields: [order.organizationId],
    references: [organization.id],
  }),
  orderedByUser: one(user, {
    fields: [order.orderedByUserId],
    references: [user.id],
  }),
  invoice: one(invoice, {
    fields: [order.invoiceId],
    references: [invoice.id],
  }),
  orderItems: many(orderItem),
  payments: many(payment),
}));

export const orderItemRelations = relations(orderItem, ({ one, many }) => ({
  order: one(order, {
    fields: [orderItem.orderId],
    references: [order.id],
  }),
  product: one(product, {
    fields: [orderItem.productId],
    references: [product.id],
  }),
  supplier: one(supplier, {
    fields: [orderItem.supplierId],
    references: [supplier.id],
  }),
  domainRegistration: many(domainRegistration),
  sslOrder: many(sslOrder),
  objectStorageOrder: many(objectStorageOrder),
  bareMetalOrder: many(bareMetalOrder),
}));

export const paymentRelations = relations(payment, ({ one, many }) => ({
  order: one(order, {
    fields: [payment.orderId],
    references: [order.id],
  }),
  organization: one(organization, {
    fields: [payment.organizationId],
    references: [organization.id],
  }),
  invoice: one(invoice, {
    fields: [payment.invoiceId],
    references: [invoice.id],
  }),
  refunds: many(refund),
}));

export const refundRelations = relations(refund, ({ one }) => ({
  payment: one(payment, {
    fields: [refund.paymentId],
    references: [payment.id],
  }),
}));

export const domainContactRelations = relations(domainContact, ({ one }) => ({
  organization: one(organization, {
    fields: [domainContact.organizationId],
    references: [organization.id],
  }),
}));

export const domainRegistrationRelations = relations(
  domainRegistration,
  ({ one, many }) => ({
    orderItem: one(orderItem, {
      fields: [domainRegistration.orderItemId],
      references: [orderItem.id],
    }),
    supplier: one(supplier, {
      fields: [domainRegistration.supplierId],
      references: [supplier.id],
    }),
    domainDnsRecords: many(domainDnsRecord),
    domainNameservers: many(domainNameserver),
    domainForwardings: many(domainForwarding),
    domainDnssecs: many(domainDnssec),
    domainDocumentVerifications: many(domainDocumentVerification),
    whoisProtection: many(whoisProtection),
    domainPolls: many(domainPoll),
  }),
);

export const domainDnsRecordRelations = relations(
  domainDnsRecord,
  ({ one }) => ({
    domainRegistration: one(domainRegistration, {
      fields: [domainDnsRecord.domainRegistrationId],
      references: [domainRegistration.id],
    }),
  }),
);

export const domainNameserverRelations = relations(
  domainNameserver,
  ({ one }) => ({
    domainRegistration: one(domainRegistration, {
      fields: [domainNameserver.domainRegistrationId],
      references: [domainRegistration.id],
    }),
  }),
);

export const domainForwardingRelations = relations(
  domainForwarding,
  ({ one }) => ({
    domainRegistration: one(domainRegistration, {
      fields: [domainForwarding.domainRegistrationId],
      references: [domainRegistration.id],
    }),
  }),
);

export const domainDnssecRelations = relations(domainDnssec, ({ one }) => ({
  domainRegistration: one(domainRegistration, {
    fields: [domainDnssec.domainRegistrationId],
    references: [domainRegistration.id],
  }),
}));

export const domainDocumentVerificationRelations = relations(
  domainDocumentVerification,
  ({ one }) => ({
    domainRegistration: one(domainRegistration, {
      fields: [domainDocumentVerification.domainRegistrationId],
      references: [domainRegistration.id],
    }),
  }),
);

export const whoisProtectionRelations = relations(
  whoisProtection,
  ({ one }) => ({
    domainRegistration: one(domainRegistration, {
      fields: [whoisProtection.domainRegistrationId],
      references: [domainRegistration.id],
    }),
  }),
);

export const domainPollRelations = relations(domainPoll, ({ one }) => ({
  domainRegistration: one(domainRegistration, {
    fields: [domainPoll.domainRegistrationId],
    references: [domainRegistration.id],
  }),
}));

export const sslOrderRelations = relations(sslOrder, ({ one }) => ({
  orderItem: one(orderItem, {
    fields: [sslOrder.orderItemId],
    references: [orderItem.id],
  }),
  supplier: one(supplier, {
    fields: [sslOrder.supplierId],
    references: [supplier.id],
  }),
}));

export const objectStorageOrderRelations = relations(
  objectStorageOrder,
  ({ one, many }) => ({
    orderItem: one(orderItem, {
      fields: [objectStorageOrder.orderItemId],
      references: [orderItem.id],
    }),
    supplier: one(supplier, {
      fields: [objectStorageOrder.supplierId],
      references: [supplier.id],
    }),
    objectStorageKeys: many(objectStorageKey),
    objectStorageBuckets: many(objectStorageBucket),
  }),
);

export const objectStorageKeyRelations = relations(
  objectStorageKey,
  ({ one }) => ({
    objectStorageOrder: one(objectStorageOrder, {
      fields: [objectStorageKey.objectStorageOrderId],
      references: [objectStorageOrder.id],
    }),
  }),
);

export const objectStorageBucketRelations = relations(
  objectStorageBucket,
  ({ one }) => ({
    objectStorageOrder: one(objectStorageOrder, {
      fields: [objectStorageBucket.objectStorageOrderId],
      references: [objectStorageOrder.id],
    }),
  }),
);

export const bareMetalOrderRelations = relations(bareMetalOrder, ({ one }) => ({
  orderItem: one(orderItem, {
    fields: [bareMetalOrder.orderItemId],
    references: [orderItem.id],
  }),
  supplier: one(supplier, {
    fields: [bareMetalOrder.supplierId],
    references: [supplier.id],
  }),
}));
