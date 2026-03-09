// packages/api/src/middleware/permission.ts

import { ORPCError } from "@orpc/server";

export type OrgRole = "owner" | "admin" | "member";

type PermissionAction =
  | "order:create"
  | "order:read"
  | "order:update"
  | "order:delete"
  | "order:pay";

const PERMISSION_MATRIX: Record<OrgRole, Set<PermissionAction>> = {
  owner: new Set([
    "order:create",
    "order:read",
    "order:update",
    "order:delete",
    "order:pay",
  ]),
  admin: new Set([
    "order:create",
    "order:read",
    "order:update",
    "order:pay",
  ]),
  member: new Set(["order:create", "order:read"]),
};

export function assertPermission(
  role: string,
  action: PermissionAction,
): void {
  const normalized = role as OrgRole;
  const allowed = PERMISSION_MATRIX[normalized];

  if (!allowed || !allowed.has(action)) {
    throw new ORPCError(
      "FORBIDDEN",
      {
        message: `Role '${role}' is not allowed to perform '${action}'.`,
      },
    );
  }
}