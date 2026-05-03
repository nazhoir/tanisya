// daftarnama-reseller-api.ts
import { z } from 'zod';

/* ============================== CUSTOM ERROR ============================== */
export class ApiError extends Error {
  public code: string;
  public errors?: Record<string, string[]>;

  constructor(code: string, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.errors = errors;
  }
}

/* ============================== BASE RESPONSES ============================== */
/**
 * Semua response sukses dari API ini berbentuk:
 * { code: string, message: string, data?: any }
 */
export const SuccessResponseBase = z.object({
  code: z.string(),
  message: z.string(),
  data: z.any().optional(),
});

export const ErrorResponse = z.object({
  code: z.string(),
  message: z.string(),
  error: z.any().optional(),
});

/* ============================== DATA DEFINITIONS ============================== */

// Domain Availability
export const DomainAvailabilityData = z.object({
  available: z.boolean(),
});
export const DomainAvailabilityResponse = SuccessResponseBase.extend({
  data: DomainAvailabilityData,
});
export type DomainAvailabilityResponse = z.infer<typeof DomainAvailabilityResponse>;

// Domain Registration
export const DomainRegisterRequest = z.object({
  domain_name: z.string(),
  duration: z.number().int().positive(),
  nameservers: z.array(z.string()).optional(),
  with_existing_customer: z.boolean().optional().default(false),
  username: z.string(),
  password: z.string().min(8).max(48).optional(),
  name: z.string(),
  company_name: z.string().optional(),
  email: z.string().email(),
  address_1: z.string(),
  address_2: z.string().optional(),
  address_3: z.string().optional(),
  city: z.string(),
  province: z.string(),
  country: z.string(),
  postal_code: z.string(),
  phone_number: z.string().optional(),
  mobile_phone_number: z.string().optional(),
});

export const RegisterData = z.object({
  status: z.string().optional(),
  document_status: z.string().optional(),
  expiry_date: z.string().optional(),
  epp_code: z.string().optional(),
});
export const RegisterResponse = SuccessResponseBase.extend({
  data: RegisterData,
});
export type RegisterResponse = z.infer<typeof RegisterResponse>;

// Domain Transfer
export const DomainTransferRequest = z.object({
  domain_name: z.string(),
  epp_code: z.string(),
  duration: z.number().int().positive().optional(),
  username: z.string(),
  password: z.string().optional(),
  name: z.string(),
  company_name: z.string().optional(),
  email: z.string().email(),
  address_1: z.string(),
  address_2: z.string().optional(),
  address_3: z.string().optional(),
  city: z.string(),
  province: z.string(),
  country: z.string(),
  postal_code: z.string(),
  phone_number: z.string().optional(),
  mobile_phone_number: z.string().optional(),
});

export const TransferData = z.object({
  status: z.string().optional(),
  document_status: z.string().optional(),
});
export const TransferResponse = SuccessResponseBase.extend({
  data: TransferData,
});
export type TransferResponse = z.infer<typeof TransferResponse>;

// Renew
export const RenewRequest = z.object({
  current_expiry_date: z.string(),
  duration: z.number().int().min(1).max(10),
});

export const RenewData = z.object({
  expiry_date: z.string(),
});
export const RenewResponse = SuccessResponseBase.extend({
  data: RenewData,
});
export type RenewResponse = z.infer<typeof RenewResponse>;

// Update Protection (update / transfer)
export const UpdateProtectionRequest = z.object({
  is_enable_update_protection: z.boolean(),
});
export const TransferProtectionRequest = z.object({
  is_enable_transfer_protection: z.boolean(),
});
export const ProtectionData = z.object({
  is_enable_update_protection: z.boolean().optional(),
  is_enable_transfer_protection: z.boolean().optional(),
});
export const UpdateProtectionResponse = SuccessResponseBase.extend({
  data: ProtectionData,
});
export type UpdateProtectionResponse = z.infer<typeof UpdateProtectionResponse>;

// Upload Document URL
export const UploadDocumentData = z.object({
  upload_document_uri: z.string(),
});
export const UploadDocumentResponse = SuccessResponseBase.extend({
  data: UploadDocumentData,
});
export type UploadDocumentResponse = z.infer<typeof UploadDocumentResponse>;

// Restore
export const RestoreData = z.object({
  expiry_date: z.string(),
});
export const RestoreResponse = SuccessResponseBase.extend({
  data: RestoreData,
});
export type RestoreResponse = z.infer<typeof RestoreResponse>;

// Domain Info
export const ContactInfo = z.object({
  name: z.string().optional(),
  company_name: z.string().optional(),
  email: z.string().optional(),
  address_1: z.string().optional(),
  address_2: z.string().optional(),
  address_3: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  phone_number: z.string().optional(),
  mobile_phone_number: z.string().optional(),
});

export const DomainInfoData = z.object({
  domain_name: z.string().optional(),
  type: z.string().optional(),
  epp_code: z.string().optional(),
  registration_date: z.string().optional(),
  expiry_date: z.string().optional(),
  status: z.string().optional(),
  document_status: z.string().optional(),
  is_enable_update_protection: z.boolean().optional(),
  is_enable_transfer_protection: z.boolean().optional(),
  is_auto_provisioning: z.boolean().optional(),
  is_suspended: z.boolean().optional(),
  nameservers: z.array(z.string()).optional(),
  username: z.string().optional(),
  registrant_contact: ContactInfo.optional(),
  admin_contact: ContactInfo.optional(),
  billing_contact: ContactInfo.optional(),
  technical_contact: ContactInfo.optional(),
});

export const DomainInfoResponse = SuccessResponseBase.extend({
  data: DomainInfoData,
});
export type DomainInfoResponse = z.infer<typeof DomainInfoResponse>;

// DNS Records
// A record: subDomain, type, ttl, address
// AAAA: type, ttl, address
// CNAME: subDomain, type, ttl, cname
// DNAME: subDomain, type, ttl, address
// MX: subDomain, type, ttl, preference, exchange
// NS: subDomain, type, ttl, ns
// SRV: subDomain, type, ttl, priority, weight, port, target
// TXT: subDomain, type, ttl, txt_data
export const DnsRecordSchema = z.object({
  id: z.number(),
  domainName: z.string(),
  subDomain: z.string(),
  type: z.string(),
  ttl: z.number(),
  // optional fields per type
  address: z.string().optional(),
  cname: z.string().optional(),
  preference: z.number().optional(),
  exchange: z.string().optional(),
  ns: z.string().optional(),
  priority: z.number().optional(),
  weight: z.number().optional(),
  port: z.number().optional(),
  target: z.string().optional(),
  txt_data: z.string().optional(),
});

export const DnsListData = z.array(DnsRecordSchema);
export const DnsListResponse = SuccessResponseBase.extend({
  data: DnsListData,
});
export type DnsListResponse = z.infer<typeof DnsListResponse>;

export const CreateDnsRecordRequest = z.object({
  sub_domain: z.string(),
  type: z.string(),
  ttl: z.number().int().positive().optional().default(3600),
  address: z.string().optional(),
  cname: z.string().optional(),
  preference: z.number().optional(),
  exchange: z.string().optional(),
  ns: z.string().optional(),
  priority: z.number().optional(),
  weight: z.number().optional(),
  port: z.number().optional(),
  target: z.string().optional(),
  txt_data: z.string().optional(),
});

export const DnsCreateResponse = SuccessResponseBase.extend({
  data: z.any().nullable().optional(),
});
export type DnsCreateResponse = z.infer<typeof DnsCreateResponse>;

export const DnsDeleteResponse = SuccessResponseBase.extend({
  data: z.any().nullable().optional(),
});
export type DnsDeleteResponse = z.infer<typeof DnsDeleteResponse>;

// Customer
export const CreateCustomerRequest = z.object({
  username: z.string(),
  password: z.string(),
  email: z.string().email(),
  name: z.string(),
  company_name: z.string().optional(),
  address_1: z.string(),
  address_2: z.string().optional(),
  address_3: z.string().optional(),
  city: z.string(),
  province: z.string(),
  country: z.string(),
  postal_code: z.string(),
  phone_number: z.string().optional(),
  mobile_phone_number: z.string().optional(),
});

export const CustomerCreateResponse = SuccessResponseBase.extend({
  data: z.any().optional(),
});
export type CustomerCreateResponse = z.infer<typeof CustomerCreateResponse>;

export const CustomerInfoData = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  company_name: z.string().optional(),
  address_1: z.string().optional(),
  address_2: z.string().optional(),
  address_3: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  phone_number: z.string().optional(),
  mobile_phone_number: z.string().optional(),
});

export const CustomerInfoResponse = SuccessResponseBase.extend({
  data: CustomerInfoData,
});
export type CustomerInfoResponse = z.infer<typeof CustomerInfoResponse>;

// Contact update (generic)
export const UpdateContactRequest = z.object({
  name: z.string(),
  organization_name: z.string().optional(),
  email: z.string().email(),
  address_1: z.string(),
  address_2: z.string().optional(),
  address_3: z.string().optional(),
  city: z.string(),
  province: z.string(),
  country: z.string(),
  postal_code: z.string(),
  phone_number: z.string().optional(),
  mobile_phone_number: z.string().optional(),
});

export const ContactUpdateResponse = SuccessResponseBase.extend({
  data: z.object({
    message: z.string(),
  }),
});
export type ContactUpdateResponse = z.infer<typeof ContactUpdateResponse>;

// Nameservers
export const UpdateNameserverRequest = z.object({
  nameservers: z.array(z.string()),
});
export const NameserverUpdateResponse = SuccessResponseBase.extend({
  data: z.object({
    message: z.string(),
  }),
});
export type NameserverUpdateResponse = z.infer<typeof NameserverUpdateResponse>;

// Child Nameservers
export const ChildNameserverItem = z.object({
  hostname: z.string(),
  ip_address: z.string(),
});

export const ChildNameserverListResponse = SuccessResponseBase.extend({
  data: z.array(ChildNameserverItem),
});
export type ChildNameserverListResponse = z.infer<typeof ChildNameserverListResponse>;

export const CreateChildNameserverRequest = z.object({
  subdomain: z.string(),
  ip_address: z.string(),
});

export const CreateChildNameserverData = z.object({
  hostname: z.string(),
  ip_address: z.string(),
});
export const CreateChildNameserverResponse = SuccessResponseBase.extend({
  data: CreateChildNameserverData,
});
export type CreateChildNameserverResponse = z.infer<typeof CreateChildNameserverResponse>;

// DNSSEC
export const DnsSecAlgorithm = z.object({
  id: z.number(),
  label: z.string(),
});
export const DnsSecAlgorithmsResponse = SuccessResponseBase.extend({
  data: z.array(DnsSecAlgorithm),
});
export type DnsSecAlgorithmsResponse = z.infer<typeof DnsSecAlgorithmsResponse>;

export const DnsSecDigestType = z.object({
  id: z.number(),
  label: z.string(),
});
export const DnsSecDigestTypesResponse = SuccessResponseBase.extend({
  data: z.array(DnsSecDigestType),
});
export type DnsSecDigestTypesResponse = z.infer<typeof DnsSecDigestTypesResponse>;

export const DnsSecEnableRequest = z.object({
  key_tag: z.number().int(),
  algorithm: z.number().int(),
  digest_type: z.number().int(),
  digest: z.string(),
});

export const DnsSecEnableData = z.object({
  keyTag: z.number().optional(),
  algorithm: z.number().optional(),
  digestType: z.number().optional(),
  digest: z.string().optional(),
});

export const DnsSecStatusResponse = SuccessResponseBase.extend({
  data: DnsSecEnableData.nullable().optional(),
});
export type DnsSecStatusResponse = z.infer<typeof DnsSecStatusResponse>;

export const DnsSecEnableResponse = SuccessResponseBase.extend({
  data: DnsSecEnableData,
});
export type DnsSecEnableResponse = z.infer<typeof DnsSecEnableResponse>;

export const DnsSecDisableResponse = SuccessResponseBase.extend({
  data: z.any().nullable().optional(),
});
export type DnsSecDisableResponse = z.infer<typeof DnsSecDisableResponse>;

// Pricing
export const PricingDetail = z.object({
  duration: z.number(),
  register_price: z.number(),
  transfer_price: z.number(),
  renewal_price: z.number(),
  restore_price: z.number(),
});

export const TldPricing = z.object({
  tld: z.string(),
  currency: z.string(),
  is_premium: z.boolean(),
  max_premium_character: z.number().nullable(),
  pricings: z.array(PricingDetail),
});

export const PricingListResponse = SuccessResponseBase.extend({
  data: z.array(TldPricing),
});
export type PricingListResponse = z.infer<typeof PricingListResponse>;

// Sub-reseller pricing (different structure)
export const SubResellerTldPricing = z.object({
  tld: z.string(),
  currency: z.string(),
  is_premium: z.boolean(),
  max_premium_character: z.number().nullable(),
  pricings: z.array(PricingDetail),
});

export const SubResellerPackage = z.object({
  package_name: z.string(),
  minimum_deposit: z.number(),
  balance_limit: z.number(),
  description: z.string().nullable(),
  tlds: z.array(SubResellerTldPricing),
});

export const SubResellerPricingListResponse = SuccessResponseBase.extend({
  data: z.array(SubResellerPackage),
});
export type SubResellerPricingListResponse = z.infer<typeof SubResellerPricingListResponse>;

// Balance
export const BalanceData = z.object({
  balance: z.number(),
  currency: z.string(),
});
export const BalanceResponse = SuccessResponseBase.extend({
  data: BalanceData,
});
export type BalanceResponse = z.infer<typeof BalanceResponse>;

/* ============================== API CLIENT ============================== */
export class DaftarNamaResellerAPI {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
    body?: unknown,
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) url.searchParams.append(key, String(value));
      });
    }

    const headers: HeadersInit = {
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json',
    };

    const fetchOpts: RequestInit = {
      method,
      headers,
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      fetchOpts.body = JSON.stringify(body);
    }

    const res = await fetch(url.toString(), fetchOpts);

    const responseBody = await res.json().catch(() => ({}));

    if (!res.ok) {
      // API returns { code, message, error }
      const errParsed = ErrorResponse.safeParse(responseBody);
      if (errParsed.success) {
        throw new ApiError(errParsed.data.code, errParsed.data.message, errParsed.data.error);
      }
      throw new ApiError(String(res.status), res.statusText);
    }

    return responseBody as T;
  }

  /* ======================== DOMAIN ======================== */
  async domainAvailability(domainName: string): Promise<DomainAvailabilityResponse> {
    const data = await this.request<DomainAvailabilityResponse>('GET', '/domain-availability', { domain_name: domainName });
    return DomainAvailabilityResponse.parse(data);
  }

  async registerDomain(body: z.infer<typeof DomainRegisterRequest>): Promise<RegisterResponse> {
    const safe = DomainRegisterRequest.parse(body);
    const data = await this.request<RegisterResponse>('POST', '/domains', undefined, safe);
    return RegisterResponse.parse(data);
  }

  async transferDomain(body: z.infer<typeof DomainTransferRequest>): Promise<TransferResponse> {
    const safe = DomainTransferRequest.parse(body);
    const data = await this.request<TransferResponse>('POST', '/domain/transfer', undefined, safe);
    return TransferResponse.parse(data);
  }

  async renewDomain(domainName: string, body: z.infer<typeof RenewRequest>): Promise<RenewResponse> {
    const safe = RenewRequest.parse(body);
    const data = await this.request<RenewResponse>('POST', `/domains/${domainName}/renew`, undefined, safe);
    return RenewResponse.parse(data);
  }

  async enableDomainUpdateProtection(domainName: string, enable: boolean): Promise<UpdateProtectionResponse> {
    const safe = UpdateProtectionRequest.parse({ is_enable_update_protection: enable });
    const data = await this.request<UpdateProtectionResponse>('PUT', `/domains/${domainName}/is_enable_update_protection`, undefined, safe);
    return UpdateProtectionResponse.parse(data);
  }

  async enableDomainTransferProtection(domainName: string, enable: boolean): Promise<UpdateProtectionResponse> {
    const safe = TransferProtectionRequest.parse({ is_enable_transfer_protection: enable });
    const data = await this.request<UpdateProtectionResponse>('PUT', `/domains/${domainName}/is_enable_transfer_protection`, undefined, safe);
    return UpdateProtectionResponse.parse(data);
  }

  async uploadDocumentUrl(domainName: string): Promise<UploadDocumentResponse> {
    const data = await this.request<UploadDocumentResponse>('GET', `/domains/${domainName}/upload_document_url`);
    return UploadDocumentResponse.parse(data);
  }

  async restoreDomain(domainName: string): Promise<RestoreResponse> {
    const data = await this.request<RestoreResponse>('POST', `/domains/${domainName}/restore`);
    return RestoreResponse.parse(data);
  }

  async getDomainInfo(domainName: string): Promise<DomainInfoResponse> {
    const data = await this.request<DomainInfoResponse>('GET', `/domains/${domainName}`);
    return DomainInfoResponse.parse(data);
  }

  /* ======================== DNS RECORDS ======================== */
  async getDomainDNSRecords(domainName: string): Promise<DnsListResponse> {
    const data = await this.request<DnsListResponse>('GET', `/domains/${domainName}/dns-records`);
    return DnsListResponse.parse(data);
  }

  async createDomainDNSRecord(domainName: string, body: z.infer<typeof CreateDnsRecordRequest>): Promise<DnsCreateResponse> {
    const safe = CreateDnsRecordRequest.parse(body);
    const data = await this.request<DnsCreateResponse>('POST', `/domains/${domainName}/dns-records`, undefined, safe);
    return DnsCreateResponse.parse(data);
  }

  async deleteDomainDNSRecord(domainName: string, dnsRecordId: number): Promise<DnsDeleteResponse> {
    const data = await this.request<DnsDeleteResponse>('DELETE', `/domains/${domainName}/dns-records/${dnsRecordId}`);
    return DnsDeleteResponse.parse(data);
  }

  /* ======================== CUSTOMER ======================== */
  async createCustomer(body: z.infer<typeof CreateCustomerRequest>): Promise<CustomerCreateResponse> {
    const safe = CreateCustomerRequest.parse(body);
    const data = await this.request<CustomerCreateResponse>('POST', '/customers', undefined, safe);
    return CustomerCreateResponse.parse(data);
  }

  async getCustomerInfo(username: string): Promise<CustomerInfoResponse> {
    const data = await this.request<CustomerInfoResponse>('GET', `/customers/${username}`);
    return CustomerInfoResponse.parse(data);
  }

  /* ======================== CONTACTS ======================== */
  async updateRegistrantContact(domainName: string, body: z.infer<typeof UpdateContactRequest>): Promise<ContactUpdateResponse> {
    const safe = UpdateContactRequest.parse(body);
    const data = await this.request<ContactUpdateResponse>('PUT', `/domains/${domainName}/registrant_contact`, undefined, safe);
    return ContactUpdateResponse.parse(data);
  }

  async updateTechnicalContact(domainName: string, body: z.infer<typeof UpdateContactRequest>): Promise<ContactUpdateResponse> {
    const safe = UpdateContactRequest.parse(body);
    const data = await this.request<ContactUpdateResponse>('PUT', `/domains/${domainName}/technical_contact`, undefined, safe);
    return ContactUpdateResponse.parse(data);
  }

  async updateBillingContact(domainName: string, body: z.infer<typeof UpdateContactRequest>): Promise<ContactUpdateResponse> {
    const safe = UpdateContactRequest.parse(body);
    const data = await this.request<ContactUpdateResponse>('PUT', `/domains/${domainName}/billing_contact`, undefined, safe);
    return ContactUpdateResponse.parse(data);
  }

  async updateAdminContact(domainName: string, body: z.infer<typeof UpdateContactRequest>): Promise<ContactUpdateResponse> {
    const safe = UpdateContactRequest.parse(body);
    const data = await this.request<ContactUpdateResponse>('PUT', `/domains/${domainName}/admin_contact`, undefined, safe);
    return ContactUpdateResponse.parse(data);
  }

  /* ======================== NAMESERVERS ======================== */
  async updateNameservers(domainName: string, nameservers: string[]): Promise<NameserverUpdateResponse> {
    const safe = UpdateNameserverRequest.parse({ nameservers });
    const data = await this.request<NameserverUpdateResponse>('PUT', `/domains/${domainName}/nameservers`, undefined, safe);
    return NameserverUpdateResponse.parse(data);
  }

  /* ======================== CHILD NAMESERVERS ======================== */
  async getChildNameservers(domainName: string): Promise<ChildNameserverListResponse> {
    const data = await this.request<ChildNameserverListResponse>('GET', `/domains/${domainName}/child-nameservers`);
    return ChildNameserverListResponse.parse(data);
  }

  async createChildNameserver(domainName: string, body: z.infer<typeof CreateChildNameserverRequest>): Promise<CreateChildNameserverResponse> {
    const safe = CreateChildNameserverRequest.parse(body);
    const data = await this.request<CreateChildNameserverResponse>('POST', `/domains/${domainName}/child-nameservers`, undefined, safe);
    return CreateChildNameserverResponse.parse(data);
  }

  async deleteChildNameserver(domainName: string, subDomain: string): Promise<SuccessResponseBase> {
    const data = await this.request<SuccessResponseBase>('DELETE', `/domains/${domainName}/child-nameservers/${subDomain}`);
    return SuccessResponseBase.parse(data);
  }

  /* ======================== DNSSEC ======================== */
  async getDnsSecAlgorithms(): Promise<DnsSecAlgorithmsResponse> {
    const data = await this.request<DnsSecAlgorithmsResponse>('GET', '/domains/dnssec/algorithms');
    return DnsSecAlgorithmsResponse.parse(data);
  }

  async getDnsSecDigestTypes(): Promise<DnsSecDigestTypesResponse> {
    const data = await this.request<DnsSecDigestTypesResponse>('GET', '/domains/dnssec/digest-types');
    return DnsSecDigestTypesResponse.parse(data);
  }

  async getDomainDnsSec(domainName: string): Promise<DnsSecStatusResponse> {
    const data = await this.request<DnsSecStatusResponse>('GET', `/domains/${domainName}/dnssec`);
    return DnsSecStatusResponse.parse(data);
  }

  async enableDomainDnsSec(domainName: string, body: z.infer<typeof DnsSecEnableRequest>): Promise<DnsSecEnableResponse> {
    const safe = DnsSecEnableRequest.parse(body);
    const data = await this.request<DnsSecEnableResponse>('POST', `/domains/${domainName}/dnssec`, undefined, safe);
    return DnsSecEnableResponse.parse(data);
  }

  async disableDomainDnsSec(domainName: string): Promise<DnsSecDisableResponse> {
    const data = await this.request<DnsSecDisableResponse>('DELETE', `/domains/${domainName}/dnssec`);
    return DnsSecDisableResponse.parse(data);
  }

  /* ======================== PRICING ======================== */
  async getTldPricings(): Promise<PricingListResponse> {
    const data = await this.request<PricingListResponse>('GET', '/tld-pricings');
    return PricingListResponse.parse(data);
  }

  async getCustomerPricings(): Promise<PricingListResponse> {
    const data = await this.request<PricingListResponse>('GET', '/customer-tld-pricings');
    return PricingListResponse.parse(data);
  }

  async getSubResellerPricings(): Promise<SubResellerPricingListResponse> {
    const data = await this.request<SubResellerPricingListResponse>('GET', '/sub-reseller-tld-pricings');
    // Adjust parsing: response data is array of packages
    return SubResellerPricingListResponse.parse(data);
  }

  /* ======================== BALANCE ======================== */
  async getMyBalance(): Promise<BalanceResponse> {
    const data = await this.request<BalanceResponse>('GET', '/my/balance');
    return BalanceResponse.parse(data);
  }
}