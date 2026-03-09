import { eq } from "drizzle-orm";
import { db, organization, member, user } from "../index";

export async function findOrganizationById(id: string) {
  return (
    (await db.query.organization.findFirst({
      where: eq(organization.id, id),
      with: { members: { with: { user: true } } },
    })) ?? null
  );
}

export async function updateOrganizationRecord(
  id: string,
  data: Partial<typeof organization.$inferInsert>
) {
  const [updated] = await db
    .update(organization)
    .set(data)
    .where(eq(organization.id, id))
    .returning();
  return updated ?? null;
}

export async function createDefaultOrganization(userId: string, userName: string) {
  return db.transaction(async (tx) => {
    const slug = userName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();
    const [org] = await tx
      .insert(organization)
      .values({
        id: crypto.randomUUID(),
        name: userName,
        slug,
        createdAt: new Date(),
      })
      .returning();

    if (!org) throw new Error("Failed to create organization");

    await tx.insert(member).values({
      id: crypto.randomUUID(),
      organizationId: org.id,
      userId,
      role: "owner",
      createdAt: new Date(),
    });

    return org;
  });
}

export async function listOrganizationMembers(organizationId: string) {
  return db.query.member.findMany({
    where: eq(member.organizationId, organizationId),
    with: { user: true },
  });
}