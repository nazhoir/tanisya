// ─── Role definitions ─────────────────────────────────────────────────────────

export type Role = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "USER";

/**
 * Numeric hierarchy — digunakan untuk `hasMinRole`.
 * Semakin tinggi angka = semakin tinggi privilege.
 */
const ROLE_HIERARCHY: Record<Role, number> = {
	SUPER_ADMIN: 100,
	ADMIN: 80,
	MANAGER: 60,
	USER: 20,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Cek apakah userRole memiliki setidaknya satu role dari `allowedRoles`.
 *
 * Support:
 *  - string   → role tunggal
 *  - string[] → multi-role (any match)
 */
export function hasRequiredRole(
	userRole: string | string[] | undefined,
	allowedRoles: Role[],
): boolean {
	if (!userRole) return false;

	const normalised = Array.isArray(userRole) ? userRole : [userRole];
	return normalised.some((r) => allowedRoles.includes(r as Role));
}

/**
 * Cek apakah user memiliki role dengan hierarchy >= minimum role yang diminta.
 * Berguna untuk "ADMIN dapat melakukan semua yang MANAGER bisa".
 */
export function hasMinRole(
	userRole: string | string[] | undefined,
	minimumRole: Role,
): boolean {
	if (!userRole) return false;

	const normalised = Array.isArray(userRole) ? userRole : [userRole];
	const minLevel = ROLE_HIERARCHY[minimumRole] ?? 0;

	return normalised.some((r) => (ROLE_HIERARCHY[r as Role] ?? 0) >= minLevel);
}

// ─── Convenience role groups ──────────────────────────────────────────────────

export const SUPER_ADMIN_ONLY: Role[] = ["SUPER_ADMIN"];
export const ADMIN_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN"];
export const MANAGER_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "MANAGER"];
export const ALL_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "MANAGER", "USER"];
