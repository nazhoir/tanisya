import { db } from "@tanisya/db";
import { webhookEndpoint } from "@tanisya/db/schema/webhook";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import crypto from "crypto";

export const registerWebhookEndpoint = async (input: {
  organizationId: string;
  url: string;
  description?: string;
  events: string[];
}) => {
  // Generate random secret key untuk klien
  const secretKey = crypto.randomBytes(24).toString("hex");

  const [newEndpoint] = await db.insert(webhookEndpoint).values({
    id: `whk_${nanoid()}`,
    organizationId: input.organizationId,
    url: input.url,
    description: input.description,
    subscribedEvents: input.events,
    secret: secretKey,
  }).returning();

  return newEndpoint;
};

export const getWebhookEndpoints = async (organizationId: string) => {
  return await db.select()
    .from(webhookEndpoint)
    .where(eq(webhookEndpoint.organizationId, organizationId));
};

export const getWebhookEndpointById = async (id: string, organizationId: string) => {
  const result = await db.select()
    .from(webhookEndpoint)
    .where(
      and(
        eq(webhookEndpoint.id, id),
        eq(webhookEndpoint.organizationId, organizationId)
      )
    )
    .limit(1);
    
  return result[0];
};