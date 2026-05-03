// rdash-reseller-api.ts
import { z } from 'zod';

/* ============================== CUSTOM ERROR ============================== */
export class ApiError extends Error {
  public status: number;
  public errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

/* ============================== BASIC AUTH HELPER ============================== */
function basicAuth(username: string, password: string): string {
  if (typeof btoa !== 'undefined') {
    return 'Basic ' + btoa(`${username}:${password}`);
  }
  return 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
}

/* ============================== PAGINATION & GENERIC RESPONSES ============================== */
export const PaginationPageLink = z.object({
  url: z.string().nullable(),
  label: z.string(),
  page: z.number().nullable(),
  active: z.boolean(),
});

export const PaginationLinks = z.object({
  first: z.string(),
  last: z.string(),
  prev: z.string().nullable(),
  next: z.string().nullable(),
});

export const PaginationMeta = z.object({
  current_page: z.number(),
  from: z.number(),
  last_page: z.number(),
  links: z.array(PaginationPageLink),
  path: z.string(),
  per_page: z.number(),
  to: z.number(),
  total: z.number(),
});

export const SuccessResponse = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string(),
  });

export const PaginatedResponse = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    links: PaginationLinks,
    meta: PaginationMeta,
  });

export const EmptySuccessResponse = z.object({
  success: z.boolean().optional(),
  data: z.any().optional(),
  message: z.string().optional(),
});
export type EmptySuccessResponse = z.infer<typeof EmptySuccessResponse>;

/* ============================== DATA DEFINITIONS ============================== */

// Profile
export const ProfileData = z.object({
  id: z.number().optional(),
  name: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  subdomain: z.string().optional(),
  alias_domain: z.string().nullable().optional(),
  domain: z.string().optional(),
  currency: z.string().optional(),
  logo: z.string().optional(),
  favicon: z.string().nullable().optional(),
  color: z.string().optional(),
  is_sub: z.boolean().optional(),
});
export type ProfileData = z.infer<typeof ProfileData>;
export const ProfileResponse = SuccessResponse(ProfileData);
export type ProfileResponse = z.infer<typeof ProfileResponse>;

export const BalanceData = z.object({
  currency: z.string().optional(),
  balance: z.string().optional(),
});
export const BalanceResponse = SuccessResponse(BalanceData);
export type BalanceResponse = z.infer<typeof BalanceResponse>;

// Domain Extension & Price
export const DomainExtension = z.object({
  id: z.number(),
  extension: z.string(),
  status: z.number(),
  status_label: z.string(),
  status_badge: z.string(),
  sell_option: z.number(),
  enable_whois_protection: z.number(),
  enable_whois_protection_label: z.string(),
  enable_whois_protection_badge: z.string(),
  registry_id: z.number(),
  registry_name: z.string(),
});

export const PriceItem = z.object({
  id: z.number(),
  registry_id: z.number().nullable(),
  domain_extension: DomainExtension,
  currency: z.string(),
  registration: z.record(z.string(), z.union([z.number(), z.string()])),
  renewal: z.record(z.string(), z.union([z.number(), z.string()])),
  transfer: z.string(),
  redemption: z.string(),
  proxy: z.string(),
});

export const PricesResponse = PaginatedResponse(PriceItem);
export type PricesResponse = z.infer<typeof PricesResponse>;

export const PriceDetailResponse = SuccessResponse(PriceItem);
export type PriceDetailResponse = z.infer<typeof PriceDetailResponse>;

// Transactions
export const TransactionItem = z.object({
  id: z.number(),
  reseller_id: z.number(),
  subreseller_id: z.number().nullable(),
  type: z.number(),
  type_label: z.string(),
  description: z.string(),
  direction: z.string(),
  currency: z.string(),
  amount: z.string(),
  period: z.number(),
  note: z.string().nullable(),
  closing_balance: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const TransactionsResponse = PaginatedResponse(TransactionItem);
export type TransactionsResponse = z.infer<typeof TransactionsResponse>;

export const TransactionDetailResponse = SuccessResponse(TransactionItem);
export type TransactionDetailResponse = z.infer<typeof TransactionDetailResponse>;

// Customers
export const CustomerItem = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  organization: z.string(),
  street_1: z.string(),
  street_2: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  country_code: z.string(),
  postal_code: z.string(),
  voice: z.string(),
  fax: z.string().nullable(),
  is_2fa_enabled: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CustomerListResponse = PaginatedResponse(CustomerItem);
export type CustomerListResponse = z.infer<typeof CustomerListResponse>;

export const CustomerShowResponse = SuccessResponse(CustomerItem);
export type CustomerShowResponse = z.infer<typeof CustomerShowResponse>;

export const CustomerCreateResponse = SuccessResponse(CustomerItem);
export type CustomerCreateResponse = z.infer<typeof CustomerCreateResponse>;

export const CustomerDeleteResponse = SuccessResponse(z.string());
export type CustomerDeleteResponse = z.infer<typeof CustomerDeleteResponse>;

// Contacts
export const ContactItem = z.object({
  id: z.number(),
  contact_id: z.string(),
  label: z.string(),
  name: z.string(),
  email: z.string().email(),
  organization: z.string(),
  street_1: z.string(),
  street_2: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  country_code: z.string(),
  postal_code: z.string(),
  voice: z.string(),
  fax: z.string(),
  status: z.number().nullable(),
  status_label: z.string(),
  pending_change: z.boolean().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const ContactListResponse = PaginatedResponse(ContactItem);
export type ContactListResponse = z.infer<typeof ContactListResponse>;

export const ContactShowResponse = SuccessResponse(ContactItem);
export type ContactShowResponse = z.infer<typeof ContactShowResponse>;

export const ContactCreateResponse = SuccessResponse(ContactItem);
export type ContactCreateResponse = z.infer<typeof ContactCreateResponse>;

export const ContactDeleteResponse = SuccessResponse(z.string());
export type ContactDeleteResponse = z.infer<typeof ContactDeleteResponse>;

// Validation Error
export const ValidationErrorResponse = z.object({
  success: z.literal(false),
  message: z.string(),
  errors: z.record(z.string(), z.array(z.string())),
});
export type ValidationErrorResponse = z.infer<typeof ValidationErrorResponse>;

// Domain Summary
export const DomainSummaryItem = z.object({
  id: z.number(),
  name: z.string(),
  status: z.number(),
  status_label: z.string(),
  status_badge: z.string(),
  status_reason: z.string().nullable(),
  verification_status: z.number(),
  verification_status_label: z.string(),
  verification_status_badge: z.string(),
  is_premium: z.number(),
  is_locked: z.number(),
  is_locked_label: z.string(),
  is_locked_badge: z.string(),
  is_registrar_locked: z.number(),
  is_registrar_locked_label: z.string(),
  is_registrar_locked_badge: z.string(),
  reseller_id: z.number(),
  nameserver_1: z.string(),
  nameserver_2: z.string(),
  nameserver_3: z.string().nullable(),
  nameserver_4: z.string().nullable(),
  nameserver_5: z.string().nullable(),
  notes: z.string().nullable(),
  expired_at: z.string(),
  created_at: z.string(),
});

export const DomainListResponse = PaginatedResponse(DomainSummaryItem);
export type DomainListResponse = z.infer<typeof DomainListResponse>;

// Domain Detail
export const DomainDetailData = z.object({
  id: z.number().optional(),
  name: z.string().optional(),
  nameserver_1: z.string().nullable().optional(),
  nameserver_2: z.string().nullable().optional(),
  nameserver_3: z.string().nullable().optional(),
  nameserver_4: z.string().nullable().optional(),
  nameserver_5: z.string().nullable().optional(),
  customer: CustomerItem.optional().nullable(),
  admin_contact: ContactItem.optional().nullable(),
  billing_contact: ContactItem.optional().nullable(),
  tech_contact: ContactItem.optional().nullable(),
  registrant_contact: ContactItem.optional().nullable(),
  status: z.number().optional(),
  status_label: z.string().optional(),
  status_badge: z.string().optional(),
  status_reason: z.string().nullable().optional(),
  verification_status: z.number().optional(),
  verification_status_label: z.string().optional(),
  verification_status_badge: z.string().optional(),
  is_premium: z.number().optional(),
  is_locked: z.number().optional(),
  is_locked_label: z.string().optional(),
  is_locked_badge: z.string().optional(),
  is_registrar_locked: z.number().optional(),
  is_registrar_locked_label: z.string().optional(),
  is_registrar_locked_badge: z.string().optional(),
  whois_protection: z.number().optional(),
  whois_protection_label: z.string().optional(),
  whois_protection_badge: z.string().optional(),
  whois_protection_allowed: z.number().optional(),
  whois_protection_purchased: z.union([z.boolean(), z.number()]).optional(),
  whois_protection_expired: z.boolean().optional(),
  is_required_document: z.number().optional(),
  is_refundable: z.boolean().optional(),
  provisioning: z.string().optional(),
  provisioning_badge: z.string().optional(),
  provisioning_type: z.string().optional(),
  token: z.string().optional(),
  notes: z.string().nullable().optional(),
  tld: z.string().optional(),
  reg: z.string().optional(),
  expired_at: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type DomainDetailData = z.infer<typeof DomainDetailData>;
export const DomainDetailResponse = SuccessResponse(DomainDetailData);
export type DomainDetailResponse = z.infer<typeof DomainDetailResponse>;

// Domain Simple
export const DomainSimpleResponse = SuccessResponse(z.string());
export type DomainSimpleResponse = z.infer<typeof DomainSimpleResponse>;

// Auth Code
export const DomainAuthCodeResponse = SuccessResponse(z.string());
export type DomainAuthCodeResponse = z.infer<typeof DomainAuthCodeResponse>;

// Availability
export const DomainAvailabilityItem = z.object({
  name: z.string(),
  available: z.number(),
  message: z.string(),
});
export const DomainAvailabilityResponse = SuccessResponse(z.array(DomainAvailabilityItem));
export type DomainAvailabilityResponse = z.infer<typeof DomainAvailabilityResponse>;

// Whois
export const DomainWhoisData = z.object({
  available: z.number().optional(),
  name: z.string().optional(),
  message: z.string().optional(),
  domain_id: z.string().optional(),
  registrar: z.string().optional(),
  provided: z.string().optional(),
  status: z.array(z.string()).optional(),
  nameserver: z.array(z.string()).optional(),
  dnssec: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  expired_at: z.string().optional(),
});
export const DomainWhoisResponse = SuccessResponse(DomainWhoisData);
export type DomainWhoisResponse = z.infer<typeof DomainWhoisResponse>;

// Register / Transfer / Renew / Restore data
export const DomainRegActionData = z.object({
  id: z.number().optional(),
  name: z.string().optional(),
  nameserver_1: z.string().nullable().optional(),
  nameserver_2: z.string().nullable().optional(),
  nameserver_3: z.string().nullable().optional(),
  nameserver_4: z.string().nullable().optional(),
  nameserver_5: z.string().nullable().optional(),
  status: z.number().nullable().optional(),
  status_label: z.string().optional(),
  status_badge: z.string().optional(),
  status_reason: z.string().nullable().optional(),
  verification_status: z.number().nullable().optional(),
  verification_status_label: z.string().optional(),
  verification_status_badge: z.string().optional(),
  is_premium: z.union([z.boolean(), z.number()]).optional(),
  is_locked: z.number().nullable().optional(),
  is_locked_label: z.string().optional(),
  is_locked_badge: z.string().optional(),
  is_registrar_locked: z.number().nullable().optional(),
  is_registrar_locked_label: z.string().optional(),
  is_registrar_locked_badge: z.string().optional(),
  whois_protection: z.union([z.boolean(), z.number()]).optional(),
  whois_protection_label: z.string().optional(),
  whois_protection_badge: z.string().optional(),
  whois_protection_allowed: z.number().optional(),
  whois_protection_purchased: z.union([z.boolean(), z.number()]).optional(),
  whois_protection_expired: z.boolean().optional(),
  is_required_document: z.number().optional(),
  is_refundable: z.boolean().optional(),
  provisioning: z.string().optional(),
  provisioning_badge: z.string().optional(),
  provisioning_type: z.string().optional(),
  token: z.string().optional(),
  notes: z.string().nullable().optional(),
  tld: z.string().optional(),
  reg: z.string().optional(),
  expired_at: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const DomainRegisterResponse = SuccessResponse(DomainRegActionData);
export type DomainRegisterResponse = z.infer<typeof DomainRegisterResponse>;

export const DomainTransferResponse = SuccessResponse(DomainRegActionData);
export type DomainTransferResponse = z.infer<typeof DomainTransferResponse>;

export const DomainRenewResponse = SuccessResponse(DomainRegActionData);
export type DomainRenewResponse = z.infer<typeof DomainRenewResponse>;

export const DomainRestoreResponse = SuccessResponse(DomainRegActionData);
export type DomainRestoreResponse = z.infer<typeof DomainRestoreResponse>;

export const DomainUpdateNameserverResponse = SuccessResponse(DomainRegActionData);
export type DomainUpdateNameserverResponse = z.infer<typeof DomainUpdateNameserverResponse>;

// Update Contact response
export const DomainUpdateContactData = z.object({
  id: z.number().optional(),
  name: z.string().optional(),
  nameserver_1: z.string().nullable().optional(),
  nameserver_2: z.string().nullable().optional(),
  nameserver_3: z.string().nullable().optional(),
  nameserver_4: z.string().nullable().optional(),
  nameserver_5: z.string().nullable().optional(),
  admin_contact: ContactItem.optional(),
  billing_contact: ContactItem.optional(),
  tech_contact: ContactItem.optional(),
  registrant_contact: ContactItem.optional(),
  status: z.number().optional(),
  status_label: z.string().optional(),
  status_badge: z.string().optional(),
  status_reason: z.string().nullable().optional(),
  verification_status: z.number().optional(),
  verification_status_label: z.string().optional(),
  verification_status_badge: z.string().optional(),
  is_premium: z.number().optional(),
  is_locked: z.number().optional(),
  is_locked_label: z.string().optional(),
  is_locked_badge: z.string().optional(),
  is_registrar_locked: z.number().optional(),
  is_registrar_locked_label: z.string().optional(),
  is_registrar_locked_badge: z.string().optional(),
  whois_protection: z.number().optional(),
  whois_protection_label: z.string().optional(),
  whois_protection_badge: z.string().optional(),
  whois_protection_allowed: z.number().optional(),
  whois_protection_purchased: z.number().optional(),
  whois_protection_expired: z.boolean().optional(),
  is_required_document: z.number().optional(),
  is_refundable: z.boolean().optional(),
  provisioning: z.string().optional(),
  provisioning_badge: z.string().optional(),
  provisioning_type: z.string().optional(),
  token: z.string().optional(),
  notes: z.string().nullable().optional(),
  tld: z.string().optional(),
  reg: z.string().optional(),
  expired_at: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export const DomainUpdateContactResponse = SuccessResponse(DomainUpdateContactData);
export type DomainUpdateContactResponse = z.infer<typeof DomainUpdateContactResponse>;

// Resend verification
export const DomainResendVerificationResponse = SuccessResponse(z.string());
export type DomainResendVerificationResponse = z.infer<typeof DomainResendVerificationResponse>;

// DNSSEC
export const DomainDnssecItem = z.object({
  id: z.number(),
  domain_id: z.number(),
  keytag: z.number(),
  algorithm: z.number(),
  digesttype: z.number(),
  digest: z.string(),
  status: z.number(),
  status_label: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const DomainDnssecListResponse = SuccessResponse(z.array(DomainDnssecItem));
export type DomainDnssecListResponse = z.infer<typeof DomainDnssecListResponse>;

export const DomainDnssecAddResponse = SuccessResponse(DomainDnssecItem);
export type DomainDnssecAddResponse = z.infer<typeof DomainDnssecAddResponse>;

export const DomainDnssecDeleteResponse = SuccessResponse(z.string());
export type DomainDnssecDeleteResponse = z.infer<typeof DomainDnssecDeleteResponse>;

// Hosts
export const HostItem = z.object({
  id: z.number(),
  domain_id: z.number(),
  hostname: z.string(),
  nameserver: z.string(),
  ip_address: z.string(),
  status: z.number(),
  status_label: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const HostListResponse = PaginatedResponse(HostItem);
export type HostListResponse = z.infer<typeof HostListResponse>;

export const HostShowResponse = SuccessResponse(HostItem);
export type HostShowResponse = z.infer<typeof HostShowResponse>;

export const HostCreateResponse = SuccessResponse(HostItem);
export type HostCreateResponse = z.infer<typeof HostCreateResponse>;

export const HostUpdateResponse = SuccessResponse(HostItem);
export type HostUpdateResponse = z.infer<typeof HostUpdateResponse>;

export const HostDeleteResponse = SuccessResponse(z.string());
export type HostDeleteResponse = z.infer<typeof HostDeleteResponse>;

// Polls
export const PollListItem = z.object({
  id: z.number(),
  name: z.string(),
  status: z.string(),
  direction: z.string(),
  action_status: z.number(),
  action_status_label: z.string(),
  message: z.string(),
  domain: z.string().nullable(),
  updated_at: z.string(),
  created_at: z.string(),
});

export const PollStatusListResponse = PaginatedResponse(PollListItem);
export type PollStatusListResponse = z.infer<typeof PollStatusListResponse>;

export const PollAckItem = z.object({
  id: z.number(),
  name: z.string(),
  status: z.string(),
  direction: z.string(),
  action_status: z.union([z.string(), z.number()]),
  action_status_label: z.string(),
  message: z.string(),
  updated_at: z.string(),
  created_at: z.string(),
});

export const PollAckResponse = SuccessResponse(PollAckItem);
export type PollAckResponse = z.infer<typeof PollAckResponse>;

// DNS Records
export const DnsRecordItem = z.object({
  prefix: z.string(),
  name: z.string(),
  type: z.string(),
  content: z.string(),
  ttl: z.number(),
});

export const DnsListResponse = SuccessResponse(z.array(DnsRecordItem));
export type DnsListResponse = z.infer<typeof DnsListResponse>;

export const DnsSimpleResponse = SuccessResponse(z.string());
export type DnsSimpleResponse = z.infer<typeof DnsSimpleResponse>;

// Whois Protection Show
export const WhoisProtectionData = z.object({
  id: z.number().optional(),
  name: z.string().optional(),
  whois_protection: z.number().optional(),
  whois_protection_label: z.string().optional(),
  whois_protection_badge: z.string().optional(),
  whois_protection_allowed: z.number().optional(),
  whois_protection_allowed_label: z.string().optional(),
  whois_protection_purchased: z.number().optional(),
  whois_protection_purchased_label: z.string().optional(),
});
export const WhoisProtectionResponse = SuccessResponse(WhoisProtectionData);
export type WhoisProtectionResponse = z.infer<typeof WhoisProtectionResponse>;

/* ============================== REQUEST SCHEMAS ============================== */

// Account queries
export const PricesQuery = z.object({
  'domainExtension[extension]': z.string().optional(),
  promo: z.union([z.boolean(), z.string()]).optional(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
});

export const TransactionsQuery = z.object({
  transaction: z.enum(['deposit', 'domain', 'ssl', 'object-storage', 'note']).optional(),
  description: z.string().optional(),
  tld: z.string().optional(),
  amount_range: z.string().optional(),
  date_range: z.string(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
});

// Customers
export const CustomerListQuery = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  organization: z.string().optional(),
  city: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
});

export const CustomerCreateBody = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  password_confirmation: z.string().min(6),
  organization: z.string(),
  street_1: z.string(),
  street_2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  country_code: z.string(),
  postal_code: z.string(),
  voice: z.string().min(9).max(20),
  fax: z.string().optional(),
});

export const CustomerUpdateBody = CustomerCreateBody;

// Contacts
export const ContactListQuery = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  organization: z.string().optional(),
  city: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
});

export const ContactCreateBody = z.object({
  label: z.enum(['Default', 'Admin', 'Technical', 'Billing', 'Registrant']),
  name: z.string(),
  email: z.string().email(),
  organization: z.string(),
  street_1: z.string(),
  street_2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  country_code: z.string(),
  postal_code: z.string(),
  voice: z.string().min(9).max(20),
  fax: z.string().optional(),
  reference: z.string().optional(),
});

export const ContactUpdateBody = ContactCreateBody.omit({ reference: true });

// Domains
export const DomainListQuery = z.object({
  customer_id: z.coerce.number().optional(),
  name: z.string().optional(),
  status: z.coerce.number().optional(),
  verification_status: z.coerce.number().optional(),
  required_document: z.coerce.number().optional(),
  created_range: z.string().optional(),
  expired_range: z.string().optional(),
  'f_params[orderBy][field]': z.string().optional(),
  'f_params[orderBy][type]': z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
});

export const DomainAvailabilityQuery = z.object({
  domain: z.string(),
  include_premium_domains: z.union([z.boolean(), z.string()]).optional(),
});

export const DomainDetailsQuery = z.object({
  domain_name: z.string(),
});

export const DomainWhoisQuery = z.object({
  domain: z.string(),
});

export const DomainRegisterBody = z.object({
  name: z.string(),
  period: z.coerce.number().int().min(1),
  customer_id: z.coerce.number().int(),
  'nameserver[0]': z.string().optional(),
  'nameserver[1]': z.string().optional(),
  'nameserver[2]': z.string().optional(),
  'nameserver[3]': z.string().optional(),
  'nameserver[4]': z.string().optional(),
  buy_whois_protection: z.union([z.boolean(), z.string()]).optional(),
  include_premium_domains: z.union([z.boolean(), z.string()]).optional(),
  registrant_contact_id: z.coerce.number().int().optional(),
});

export const DomainTransferBody = z.object({
  name: z.string(),
  auth_code: z.string(),
  period: z.coerce.number().int().min(1),
  customer_id: z.coerce.number().int(),
  'nameserver[0]': z.string().optional(),
  'nameserver[1]': z.string().optional(),
  'nameserver[2]': z.string().optional(),
  'nameserver[3]': z.string().optional(),
  'nameserver[4]': z.string().optional(),
  buy_whois_protection: z.union([z.boolean(), z.string()]).optional(),
});

export const DomainRenewBody = z.object({
  period: z.coerce.number().int().min(1).max(10),
  current_date: z.string(),
  buy_whois_protection: z.union([z.boolean(), z.string()]).optional(),
});

export const DomainUpdateNameserverBody = z.object({
  customer_id: z.coerce.number().int().optional(),
  'nameserver[0]': z.string().min(1),
  'nameserver[1]': z.string().min(1),
  'nameserver[2]': z.string().optional(),
  'nameserver[3]': z.string().optional(),
  'nameserver[5]': z.string().optional(),
});

export const DomainUpdateContactBody = z.object({
  admin_contact_id: z.coerce.number().int(),
  tech_contact_id: z.coerce.number().int(),
  billing_contact_id: z.coerce.number().int(),
  registrant_contact_id: z.coerce.number().int(),
  customer_id: z.coerce.number().int().optional(),
});

export const DomainLockBody = z.object({
  reason: z.string().optional(),
});

export const DomainSuspendedBody = z.object({
  type: z.coerce.number().int().refine((v) => v === 1 || v === 2, { message: 'Must be 1 (Abuse) or 2 (Other)' }),
  reason: z.string(),
});

export const DomainMoveBody = z.object({
  customer_id: z.coerce.number().int(),
});

export const DomainCancelTransferBody = z.object({
  period: z.coerce.number().int().min(1),
  current_date: z.string(),
});

export const ResetAuthCodeBody = z.object({
  auth_code: z.string().min(8).regex(/^(?=.*[a-zA-Z])(?=.*\d)/, 'Must contain at least one letter and one number'),
});

// DNS
export const DnsCreateBody = z.object({
  'records[0][name]': z.string(),
  'records[0][type]': z.enum(['A', 'AAAA', 'MXE', 'MX', 'CNAME', 'SPF']),
  'records[0][content]': z.string(),
  'records[0][ttl]': z.coerce.number().int().positive().default(3600),
  'records[1][name]': z.string().optional(),
  'records[1][type]': z.enum(['A', 'AAAA', 'MXE', 'MX', 'CNAME', 'SPF']).optional(),
  'records[1][content]': z.string().optional(),
  'records[1][ttl]': z.coerce.number().int().positive().optional(),
  'records[2][name]': z.string().optional(),
  'records[2][type]': z.enum(['A', 'AAAA', 'MXE', 'MX', 'CNAME', 'SPF']).optional(),
  'records[2][content]': z.string().optional(),
});

export const DnsUpdateRecordBody = z.object({
  name: z.string(),
  type: z.enum(['A', 'AAAA', 'MXE', 'MX', 'CNAME', 'SPF']),
  content: z.string(),
  ttl: z.coerce.number().int().positive().optional(),
});

export const DnsDeleteRecordBody = z.object({
  name: z.string(),
  type: z.enum(['A', 'AAAA', 'MXE', 'MX', 'CNAME', 'SPF']),
  content: z.string(),
});

// DNSSEC
export const DnssecAddBody = z.object({
  keytag: z.coerce.number().int().min(0).max(65535),
  algorithm: z.coerce.number().int().refine((v) => [3,5,6,7,8,10,12,13,14].includes(v), { message: 'Unsupported algorithm' }),
  digesttype: z.coerce.number().int().refine((v) => [1,2].includes(v), { message: 'Must be 1 or 2' }),
  digest: z.string().max(64),
});

// Forwarding
export const ForwardingCreateBody = z.object({
  from: z.string(),
  to: z.string(),
});

// Hosts
export const HostCreateBody = z.object({
  hostname: z.string(),
  ip_address: z.string(),
});

export const HostUpdateBody = z.object({
  hostname: z.string().optional(),
  ip_address: z.string().optional(),
});

// Polls
export const PollAckBody = z.object({
  action_status: z.coerce.number().int().refine((v) => v === 0 || v === 1, { message: 'Must be 0 or 1' }),
});

// Object Storage
export const ObjectStorageCreateBody = z.object({
  name: z.string(),
  size: z.coerce.number().int().positive(),
  billing_cycle: z.coerce.number().int().min(1).max(36),
  customer_id: z.coerce.number().int(),
});

export const ObjectStorageSuspendBody = z.object({
  reason: z.string(),
});

export const ObjectStorageUpgradeBody = z.object({
  size: z.coerce.number().int().positive(),
});

export const ObjectStorageBucketCreateBody = z.object({
  name: z.string(),
});

export const ObjectStorageKeyCreateBody = z.object({
  label: z.string().optional(),
});

// SSL
export const SslGenerateCsrBody = z.object({
  ssl_product_id: z.coerce.number().int(),
  csr_name: z.string(),
  csr_email: z.string().email(),
  csr_organization: z.string(),
  csr_department: z.string(),
  csr_city: z.string(),
  csr_state: z.string(),
  csr_country: z.string(),
});

export const SslOrderBody = z.object({
  ssl_product_id: z.coerce.number().int(),
  customer_id: z.coerce.number().int(),
  dcv_method: z.string(),
  dcv_email: z.string().optional(),
  period: z.coerce.number().int(),
  csr_code: z.string(),
  admin_firstname: z.string(),
  admin_lastname: z.string(),
  admin_organization: z.string(),
  admin_address: z.string(),
  admin_phone: z.string(),
  admin_title: z.string(),
  admin_email: z.string().email(),
  admin_city: z.string(),
  admin_country: z.string(),
  admin_postal_code: z.string(),
  tech_firstname: z.string(),
  tech_lastname: z.string(),
  tech_organization: z.string(),
  tech_address: z.string(),
  tech_phone: z.string(),
  tech_title: z.string(),
  tech_email: z.string().email(),
  tech_city: z.string(),
  tech_country: z.string(),
  tech_postal_code: z.string(),
  org_name: z.string().optional(),
  org_division: z.string().optional(),
  org_address: z.string().optional(),
  org_city: z.string().optional(),
  org_country: z.string().optional(),
  org_phone: z.string().optional(),
  org_postal_code: z.string().optional(),
  org_region: z.string().optional(),
});

export const SslChangeValidationMethodBody = z.object({
  dcv_method: z.string(),
  dcv_email: z.string().optional(),
});

export const SslReissueBody = z.object({
  csr_code: z.string(),
});

// Bare Metal
export const BareMetalOrderBody = z.object({
  bare_metal_product_id: z.coerce.number().int(),
  customer_id: z.coerce.number().int(),
  name: z.string(),
  cycle: z.enum(['monthly', 'quarterly', 'annually']),
  os: z.string(),
  keypair: z.string(),
});

export const BareMetalStateBody = z.object({
  state: z.enum(['on', 'off', 'reset']),
});

export const BareMetalRebuildBody = z.object({
  os: z.string(),
});

/* ============================== API CLIENT ============================== */
export class RDashResellerAPI {
  private baseUrl: string;
  private basePath: string;
  private authHeader: string;

  /**
   * @param baseUrl - Base URL (e.g. 'https://api.rdash.id')
   * @param username - Reseller ID
   * @param password - API key
   * @param basePath - API prefix path, default '/v1'
   */
  constructor(baseUrl: string, username: string, password: string, basePath = '/v1') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.basePath = basePath.startsWith('/') ? basePath : `/${basePath}`;
    this.authHeader = basicAuth(username, password);
  }

  private async request(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string, // path relatif terhadap basePath, contoh: '/account/profile'
    params?: Record<string, string | number | boolean | undefined>,
    body?: Record<string, string | number | boolean | undefined>,
  ): Promise<any> {
    const url = new URL(`${this.baseUrl}${this.basePath}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) url.searchParams.append(key, String(value));
      });
    }
    const headers: Record<string, string> = {
      Authorization: this.authHeader,
    };
    let finalBody: URLSearchParams | undefined;
    if (body) {
      const sp = new URLSearchParams();
      Object.entries(body).forEach(([k, v]) => {
        if (v !== undefined) sp.append(k, String(v));
      });
      finalBody = sp;
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    const res = await fetch(url.toString(), { method, headers, body: finalBody });

    if (!res.ok) {
      let errorBody: any = {};
      try {
        errorBody = await res.json();
      } catch { /* not JSON */ }
      const parsed = ValidationErrorResponse.safeParse(errorBody);
      if (parsed.success) {
        throw new ApiError(res.status, parsed.data.message, parsed.data.errors);
      }
      throw new ApiError(res.status, errorBody.message ?? res.statusText);
    }

    return res.json();
  }

  /* ======================== ACCOUNT ======================== */
  async getProfile(): Promise<ProfileResponse> {
    const data = await this.request('GET', '/account/profile');
    return ProfileResponse.parse(data);
  }

  async getBalance(): Promise<BalanceResponse> {
    const data = await this.request('GET', '/account/balance');
    return BalanceResponse.parse(data);
  }

  async getPrices(query?: z.infer<typeof PricesQuery>): Promise<PricesResponse> {
    const params = PricesQuery.parse(query ?? {});
    const data = await this.request('GET', '/account/prices', params);
    return PricesResponse.parse(data);
  }

  async getPriceDetail(priceId: number): Promise<PriceDetailResponse> {
    const data = await this.request('GET', `/account/prices/${priceId}`);
    return PriceDetailResponse.parse(data);
  }

  async getTransactions(query: z.infer<typeof TransactionsQuery>): Promise<TransactionsResponse> {
    const params = TransactionsQuery.parse(query);
    const data = await this.request('GET', '/account/transactions', params);
    return TransactionsResponse.parse(data);
  }

  async getTransactionDetail(transactionId: number): Promise<TransactionDetailResponse> {
    const data = await this.request('GET', `/account/transactions/${transactionId}`);
    return TransactionDetailResponse.parse(data);
  }

  /* ======================== CUSTOMERS ======================== */
  async listCustomers(query?: Partial<z.infer<typeof CustomerListQuery>>): Promise<CustomerListResponse> {
    const params = CustomerListQuery.parse(query ?? {});
    const data = await this.request('GET', '/customers', params);
    return CustomerListResponse.parse(data);
  }

  async createCustomer(body: z.infer<typeof CustomerCreateBody>): Promise<CustomerCreateResponse> {
    const safeBody = CustomerCreateBody.parse(body);
    const data = await this.request('POST', '/customers', undefined, safeBody as any);
    return CustomerCreateResponse.parse(data);
  }

  async getCustomer(customerId: number): Promise<CustomerShowResponse> {
    const data = await this.request('GET', `/customers/${customerId}`);
    return CustomerShowResponse.parse(data);
  }

  async updateCustomer(customerId: number, body: z.infer<typeof CustomerUpdateBody>): Promise<CustomerShowResponse> {
    const safeBody = CustomerUpdateBody.parse(body);
    const data = await this.request('PUT', `/customers/${customerId}`, undefined, safeBody as any);
    return CustomerShowResponse.parse(data);
  }

  async deleteCustomer(customerId: number): Promise<CustomerDeleteResponse> {
    const data = await this.request('DELETE', `/customers/${customerId}`);
    return CustomerDeleteResponse.parse(data);
  }

  /* ======================== CONTACTS ======================== */
  async listContacts(customerId: number, query?: Partial<z.infer<typeof ContactListQuery>>): Promise<ContactListResponse> {
    const params = ContactListQuery.parse(query ?? {});
    const data = await this.request('GET', `/customers/${customerId}/contacts`, params);
    return ContactListResponse.parse(data);
  }

  async createContact(customerId: number, body: z.infer<typeof ContactCreateBody>): Promise<ContactCreateResponse> {
    const safeBody = ContactCreateBody.parse(body);
    const data = await this.request('POST', `/customers/${customerId}/contacts`, undefined, safeBody as any);
    return ContactCreateResponse.parse(data);
  }

  async getContact(customerId: number, contactId: number): Promise<ContactShowResponse> {
    const data = await this.request('GET', `/customers/${customerId}/contacts/${contactId}`);
    return ContactShowResponse.parse(data);
  }

  async updateContact(customerId: number, contactId: number, body: z.infer<typeof ContactUpdateBody>): Promise<ContactShowResponse> {
    const safeBody = ContactUpdateBody.parse(body);
    const data = await this.request('PUT', `/customers/${customerId}/contacts/${contactId}`, undefined, safeBody as any);
    return ContactShowResponse.parse(data);
  }

  async deleteContact(customerId: number, contactId: number): Promise<ContactDeleteResponse> {
    const data = await this.request('DELETE', `/customers/${customerId}/contacts/${contactId}`);
    return ContactDeleteResponse.parse(data);
  }

  /* ======================== DOMAINS ======================== */
  async listDomains(query?: Partial<z.infer<typeof DomainListQuery>>): Promise<DomainListResponse> {
    const params = DomainListQuery.parse(query ?? {});
    const data = await this.request('GET', '/domains', params);
    return DomainListResponse.parse(data);
  }

  async checkDomainAvailability(query: z.infer<typeof DomainAvailabilityQuery>): Promise<DomainAvailabilityResponse> {
    const params = DomainAvailabilityQuery.parse(query);
    const data = await this.request('GET', '/domains/availability', params);
    return DomainAvailabilityResponse.parse(data);
  }

  async getDomainDetails(query: z.infer<typeof DomainDetailsQuery>): Promise<DomainDetailResponse> {
    const params = DomainDetailsQuery.parse(query);
    const data = await this.request('GET', '/domains/details', params);
    return DomainDetailResponse.parse(data);
  }

  async getDomainWhois(query: z.infer<typeof DomainWhoisQuery>): Promise<DomainWhoisResponse> {
    const params = DomainWhoisQuery.parse(query);
    const data = await this.request('GET', '/domains/whois', params);
    return DomainWhoisResponse.parse(data);
  }

  async registerDomain(body: z.infer<typeof DomainRegisterBody>): Promise<DomainRegisterResponse> {
    const safeBody = DomainRegisterBody.parse(body);
    const data = await this.request('POST', '/domains', undefined, safeBody as any);
    return DomainRegisterResponse.parse(data);
  }

  async transferDomain(body: z.infer<typeof DomainTransferBody>): Promise<DomainTransferResponse> {
    const safeBody = DomainTransferBody.parse(body);
    const data = await this.request('POST', '/domains/transfer', undefined, safeBody as any);
    return DomainTransferResponse.parse(data);
  }

  async getDomain(domainId: number): Promise<DomainDetailResponse> {
    const data = await this.request('GET', `/domains/${domainId}`);
    return DomainDetailResponse.parse(data);
  }

  async deleteDomain(domainId: number): Promise<EmptySuccessResponse> {
    const data = await this.request('DELETE', `/domains/${domainId}`);
    return EmptySuccessResponse.parse(data);
  }

  /* ---------- auth code ---------- */
  async getAuthCode(domainId: number): Promise<DomainAuthCodeResponse> {
    const data = await this.request('GET', `/domains/${domainId}/auth_code`);
    return DomainAuthCodeResponse.parse(data);
  }

  async resetAuthCode(domainId: number, body: z.infer<typeof ResetAuthCodeBody>): Promise<any> {
    const safeBody = ResetAuthCodeBody.parse(body);
    return this.request('PUT', `/domains/${domainId}/auth_code`, undefined, safeBody as any);
  }

  /* ---------- nameserver ---------- */
  async updateNameserver(domainId: number, body: z.infer<typeof DomainUpdateNameserverBody>): Promise<DomainUpdateNameserverResponse> {
    const safeBody = DomainUpdateNameserverBody.parse(body);
    const data = await this.request('PUT', `/domains/${domainId}/ns`, undefined, safeBody as any);
    return DomainUpdateNameserverResponse.parse(data);
  }

  /* ---------- contacts ---------- */
  async updateDomainContacts(domainId: number, body: z.infer<typeof DomainUpdateContactBody>): Promise<DomainUpdateContactResponse> {
    const safeBody = DomainUpdateContactBody.parse(body);
    const data = await this.request('PUT', `/domains/${domainId}/contacts`, undefined, safeBody as any);
    return DomainUpdateContactResponse.parse(data);
  }

  /* ---------- lock/unlock ---------- */
  async lockDomain(domainId: number, reason?: string): Promise<DomainSimpleResponse> {
    const safeBody = DomainLockBody.parse({ reason });
    const data = await this.request('PUT', `/domains/${domainId}/locked`, undefined, safeBody as any);
    return DomainSimpleResponse.parse(data);
  }

  async unlockDomain(domainId: number): Promise<DomainSimpleResponse> {
    const data = await this.request('DELETE', `/domains/${domainId}/locked`);
    return DomainSimpleResponse.parse(data);
  }

  async registrarLockDomain(domainId: number, reason?: string): Promise<DomainSimpleResponse> {
    const safeBody = DomainLockBody.parse({ reason });
    const data = await this.request('PUT', `/domains/${domainId}/registrar-locked`, undefined, safeBody as any);
    return DomainSimpleResponse.parse(data);
  }

  async registrarUnlockDomain(domainId: number): Promise<DomainSimpleResponse> {
    const data = await this.request('DELETE', `/domains/${domainId}/registrar-locked`);
    return DomainSimpleResponse.parse(data);
  }

  /* ---------- suspend ---------- */
  async suspendDomain(domainId: number, body: z.infer<typeof DomainSuspendedBody>): Promise<DomainSimpleResponse> {
    const safeBody = DomainSuspendedBody.parse(body);
    const data = await this.request('PUT', `/domains/${domainId}/suspended`, undefined, safeBody as any);
    return DomainSimpleResponse.parse(data);
  }

  async unsuspendDomain(domainId: number): Promise<DomainSimpleResponse> {
    const data = await this.request('DELETE', `/domains/${domainId}/suspended`);
    return DomainSimpleResponse.parse(data);
  }

  /* ---------- move ---------- */
  async moveDomain(domainId: number, body: z.infer<typeof DomainMoveBody>): Promise<any> {
    const safeBody = DomainMoveBody.parse(body);
    return this.request('POST', `/domains/${domainId}/move`, undefined, safeBody as any);
  }

  /* ---------- renew ---------- */
  async renewDomain(domainId: number, body: z.infer<typeof DomainRenewBody>): Promise<DomainRenewResponse> {
    const safeBody = DomainRenewBody.parse(body);
    const data = await this.request('POST', `/domains/${domainId}/renew`, undefined, safeBody as any);
    return DomainRenewResponse.parse(data);
  }

  /* ---------- restore ---------- */
  async restoreDomain(domainId: number): Promise<DomainRestoreResponse> {
    const data = await this.request('POST', `/domains/${domainId}/restore`);
    return DomainRestoreResponse.parse(data);
  }

  /* ---------- cancel transfer ---------- */
  async cancelTransfer(domainId: number, body: z.infer<typeof DomainCancelTransferBody>): Promise<any> {
    const safeBody = DomainCancelTransferBody.parse(body);
    return this.request('POST', `/domains/${domainId}/transfer/cancel`, undefined, safeBody as any);
  }

  /* ---------- resend verification ---------- */
  async resendVerification(domainId: number): Promise<DomainResendVerificationResponse> {
    const data = await this.request('POST', `/domains/${domainId}/verification/resend`);
    return DomainResendVerificationResponse.parse(data);
  }

  /* ---------- whois protection ---------- */
  async showWhoisProtection(domainId: number): Promise<WhoisProtectionResponse> {
    const data = await this.request('GET', `/domains/${domainId}/whois-protection`);
    return WhoisProtectionResponse.parse(data);
  }

  async buyWhoisProtection(domainId: number): Promise<any> {
    return this.request('POST', `/domains/${domainId}/whois-protection`);
  }

  async enableWhoisProtection(domainId: number): Promise<any> {
    return this.request('PUT', `/domains/${domainId}/whois-protection`);
  }

  async disableWhoisProtection(domainId: number): Promise<any> {
    return this.request('DELETE', `/domains/${domainId}/whois-protection`);
  }

  /* ---------- DNS ---------- */
  async getDnsRecords(domainId: number): Promise<DnsListResponse> {
    const data = await this.request('GET', `/domains/${domainId}/dns`);
    return DnsListResponse.parse(data);
  }

  async createDnsRecords(domainId: number, body: z.infer<typeof DnsCreateBody>): Promise<DnsSimpleResponse> {
    const safeBody = DnsCreateBody.parse(body);
    const data = await this.request('POST', `/domains/${domainId}/dns`, undefined, safeBody as any);
    return DnsSimpleResponse.parse(data);
  }

  async updateDnsRecord(domainId: number, body: z.infer<typeof DnsUpdateRecordBody>): Promise<DnsSimpleResponse> {
    const safeBody = DnsUpdateRecordBody.parse(body);
    const data = await this.request('PUT', `/domains/${domainId}/dns`, undefined, safeBody as any);
    return DnsSimpleResponse.parse(data);
  }

  async deleteDnsRecord(domainId: number, body: z.infer<typeof DnsDeleteRecordBody>): Promise<DnsSimpleResponse> {
    const safeBody = DnsDeleteRecordBody.parse(body);
    const data = await this.request('DELETE', `/domains/${domainId}/dns/record`, undefined, safeBody as any);
    return DnsSimpleResponse.parse(data);
  }

  async deleteDnsZone(domainId: number): Promise<any> {
    return this.request('DELETE', `/domains/${domainId}/dns`);
  }

  /* ---------- DNSSEC ---------- */
  async enableDnssec(domainId: number): Promise<any> {
    return this.request('POST', `/domains/${domainId}/dns/sec`);
  }

  async disableDnssec(domainId: number): Promise<any> {
    return this.request('DELETE', `/domains/${domainId}/dns/sec`);
  }

  async getDnssec(domainId: number, query?: { keytag?: number; algorithm?: number; digesttype?: number; digest?: string }): Promise<DomainDnssecListResponse> {
    const data = await this.request('GET', `/domains/${domainId}/dnssec`, query as any);
    return DomainDnssecListResponse.parse(data);
  }

  async addDnssec(domainId: number, body: z.infer<typeof DnssecAddBody>): Promise<DomainDnssecAddResponse> {
    const safeBody = DnssecAddBody.parse(body);
    const data = await this.request('POST', `/domains/${domainId}/dnssec`, undefined, safeBody as any);
    return DomainDnssecAddResponse.parse(data);
  }

  async deleteDnssec(domainId: number, dnssecId: number): Promise<DomainDnssecDeleteResponse> {
    const data = await this.request('DELETE', `/domains/${domainId}/dnssec/${dnssecId}`);
    return DomainDnssecDeleteResponse.parse(data);
  }

  /* ---------- Forwarding ---------- */
  async listForwarding(domainId: number): Promise<any> {
    return this.request('GET', `/domains/${domainId}/forwarding`);
  }

  async createOrUpdateForwarding(domainId: number, body: z.infer<typeof ForwardingCreateBody>): Promise<any> {
    const safeBody = ForwardingCreateBody.parse(body);
    return this.request('POST', `/domains/${domainId}/forwarding`, undefined, safeBody as any);
  }

  async deleteForwarding(domainId: number, forwardingId: number): Promise<any> {
    return this.request('DELETE', `/domains/${domainId}/forwarding/${forwardingId}`);
  }

  /* ---------- Hosts ---------- */
  async listHosts(domainId: number, query?: { hostname?: string; 'f_params[orderBy][field]'?: string; 'f_params[orderBy][type]'?: 'asc' | 'desc' }): Promise<HostListResponse> {
    const data = await this.request('GET', `/domains/${domainId}/hosts`, query as any);
    return HostListResponse.parse(data);
  }

  async createHost(domainId: number, body: z.infer<typeof HostCreateBody>): Promise<HostCreateResponse> {
    const safeBody = HostCreateBody.parse(body);
    const data = await this.request('POST', `/domains/${domainId}/hosts`, undefined, safeBody as any);
    return HostCreateResponse.parse(data);
  }

  async getHost(domainId: number, hostId: number): Promise<HostShowResponse> {
    const data = await this.request('GET', `/domains/${domainId}/hosts/${hostId}`);
    return HostShowResponse.parse(data);
  }

  async updateHost(domainId: number, hostId: number, body: z.infer<typeof HostUpdateBody>): Promise<HostUpdateResponse> {
    const safeBody = HostUpdateBody.parse(body);
    const data = await this.request('PUT', `/domains/${domainId}/hosts/${hostId}`, undefined, safeBody as any);
    return HostUpdateResponse.parse(data);
  }

  async deleteHost(domainId: number, hostId: number): Promise<HostDeleteResponse> {
    const data = await this.request('DELETE', `/domains/${domainId}/hosts/${hostId}`);
    return HostDeleteResponse.parse(data);
  }

  /* ======================== POLLS ======================== */
  async listPolls(query?: { action_status?: 1 | 2; page?: number; limit?: number }): Promise<PollStatusListResponse> {
    const data = await this.request('GET', '/status', query as any);
    return PollStatusListResponse.parse(data);
  }

  async ackPoll(pollId: number, actionStatus: 0 | 1): Promise<PollAckResponse> {
    const safeBody = PollAckBody.parse({ action_status: actionStatus });
    const data = await this.request('PUT', `/status/${pollId}`, undefined, safeBody as any);
    return PollAckResponse.parse(data);
  }

  /* ======================== OBJECT STORAGE ======================== */
  async listObjectStorages(query?: { name?: string; page?: number; limit?: number }): Promise<any> {
    return this.request('GET', '/object-storage', query as any);
  }

  async buyObjectStorage(body: z.infer<typeof ObjectStorageCreateBody>): Promise<any> {
    const safeBody = ObjectStorageCreateBody.parse(body);
    return this.request('POST', '/object-storage', undefined, safeBody as any);
  }

  async getObjectStorage(objectStorageId: number): Promise<any> {
    return this.request('GET', `/object-storage/${objectStorageId}`);
  }

  async deleteObjectStorage(objectStorageId: number): Promise<any> {
    return this.request('DELETE', `/object-storage/${objectStorageId}`);
  }

  async showBucket(objectStorageId: number): Promise<any> {
    return this.request('GET', `/object-storage/${objectStorageId}/buckets`);
  }

  async createBucket(objectStorageId: number, body: z.infer<typeof ObjectStorageBucketCreateBody>): Promise<any> {
    const safeBody = ObjectStorageBucketCreateBody.parse(body);
    return this.request('POST', `/object-storage/${objectStorageId}/buckets`, undefined, safeBody as any);
  }

  async deleteBucket(objectStorageId: number, bucketName: string): Promise<any> {
    return this.request('DELETE', `/object-storage/${objectStorageId}/buckets/${bucketName}`);
  }

  async showAccessKeys(objectStorageId: number): Promise<any> {
    return this.request('GET', `/object-storage/${objectStorageId}/keys`);
  }

  async createAccessKey(objectStorageId: number, body?: z.infer<typeof ObjectStorageKeyCreateBody>): Promise<any> {
    const safeBody = ObjectStorageKeyCreateBody.parse(body ?? {});
    return this.request('POST', `/object-storage/${objectStorageId}/keys`, undefined, safeBody as any);
  }

  async deleteAccessKey(objectStorageId: number, keyId: number): Promise<any> {
    return this.request('DELETE', `/object-storage/${objectStorageId}/keys/${keyId}`);
  }

  async renewObjectStorage(objectStorageId: number): Promise<any> {
    return this.request('POST', `/object-storage/${objectStorageId}/renew`);
  }

  async suspendObjectStorage(objectStorageId: number, reason: string): Promise<any> {
    const safeBody = ObjectStorageSuspendBody.parse({ reason });
    return this.request('PUT', `/object-storage/${objectStorageId}/suspended`, undefined, safeBody as any);
  }

  async unsuspendObjectStorage(objectStorageId: number): Promise<any> {
    return this.request('DELETE', `/object-storage/${objectStorageId}/suspended`);
  }

  async upgradeObjectStorage(objectStorageId: number, size: number): Promise<any> {
    const safeBody = ObjectStorageUpgradeBody.parse({ size });
    return this.request('PUT', `/object-storage/${objectStorageId}/upgrade`, undefined, safeBody as any);
  }

  /* ======================== SSL ======================== */
  async listSslProducts(query?: { name?: string; page?: number; limit?: number }): Promise<any> {
    return this.request('GET', '/ssl/', query as any);
  }

  async generateCsr(body: z.infer<typeof SslGenerateCsrBody>): Promise<any> {
    const safeBody = SslGenerateCsrBody.parse(body);
    return this.request('POST', '/ssl/csr/generate', undefined, safeBody as any);
  }

  async listSslOrders(query?: { domain?: string; page?: number; limit?: number }): Promise<any> {
    return this.request('GET', '/ssl/orders/', query as any);
  }

  async orderSsl(body: z.infer<typeof SslOrderBody>): Promise<any> {
    const safeBody = SslOrderBody.parse(body);
    return this.request('POST', '/ssl/orders/', undefined, safeBody as any);
  }

  async getSslOrder(sslOrderId: number): Promise<any> {
    return this.request('GET', `/ssl/orders/${sslOrderId}`);
  }

  async changeSslValidationMethod(sslOrderId: number, body: z.infer<typeof SslChangeValidationMethodBody>): Promise<any> {
    const safeBody = SslChangeValidationMethodBody.parse(body);
    return this.request('PUT', `/ssl/orders/${sslOrderId}`, undefined, safeBody as any);
  }

  async cancelSslOrder(sslOrderId: number): Promise<any> {
    return this.request('DELETE', `/ssl/orders/${sslOrderId}`);
  }

  async downloadSsl(sslOrderId: number): Promise<any> {
    return this.request('GET', `/ssl/orders/${sslOrderId}/download`);
  }

  async reissueSsl(sslOrderId: number, csrCode: string): Promise<any> {
    const safeBody = SslReissueBody.parse({ csr_code: csrCode });
    return this.request('POST', `/ssl/orders/${sslOrderId}/reissue`, undefined, safeBody as any);
  }

  async revalidateSsl(sslOrderId: number): Promise<any> {
    return this.request('POST', `/ssl/orders/${sslOrderId}/revalidate`);
  }

  async listSslPrices(query?: { name?: string; page?: number; limit?: number }): Promise<any> {
    return this.request('GET', '/ssl/prices', query as any);
  }

  /* ======================== BARE METAL ======================== */
  async listBareMetalProducts(query?: { name?: string; page?: number; limit?: number }): Promise<any> {
    return this.request('GET', '/baremetals/', query as any);
  }

  async listBareMetalOS(bareMetalProductId: number): Promise<any> {
    return this.request('GET', `/baremetals/os/${bareMetalProductId}`);
  }

  async listBareMetalPrices(query?: { name?: string; page?: number; limit?: number }): Promise<any> {
    return this.request('GET', '/baremetals/prices', query as any);
  }

  async listBareMetalOrders(query?: { name?: string; page?: number; limit?: number }): Promise<any> {
    return this.request('GET', '/baremetals/orders/', query as any);
  }

  async orderBareMetal(body: z.infer<typeof BareMetalOrderBody>): Promise<any> {
    const safeBody = BareMetalOrderBody.parse(body);
    return this.request('POST', '/baremetals/orders/', undefined, safeBody as any);
  }

  async getBareMetalOrder(orderId: number): Promise<any> {
    return this.request('GET', `/baremetals/orders/${orderId}`);
  }

  async suspendBareMetal(orderId: number): Promise<any> {
    return this.request('PUT', `/baremetals/orders/${orderId}/suspend`);
  }

  async unsuspendBareMetal(orderId: number): Promise<any> {
    return this.request('DELETE', `/baremetals/orders/${orderId}/unsuspend`);
  }

  async changeBareMetalState(orderId: number, state: z.infer<typeof BareMetalStateBody>['state']): Promise<any> {
    const safeBody = BareMetalStateBody.parse({ state });
    return this.request('PUT', `/baremetals/orders/${orderId}/state`, undefined, safeBody as any);
  }

  async rebuildBareMetal(orderId: number, os: string): Promise<any> {
    const safeBody = BareMetalRebuildBody.parse({ os });
    return this.request('POST', `/baremetals/orders/${orderId}/rebuild`, undefined, safeBody as any);
  }

  async renewBareMetal(orderId: number): Promise<any> {
    return this.request('POST', `/baremetals/orders/${orderId}/renew`);
  }
}