export type Permission =
  | "products:write"
  | "products:delete"
  | "categories:write"
  | "categories:delete"
  | "variants:write"
  | "variants:delete"
  | "movements:write"
  | "users:manage"
  | "billing:manage";

const rolePermissions: Record<"ADMIN" | "MANAGER" | "OPERATOR", Permission[]> = {
  ADMIN: [
    "products:write",
    "products:delete",
    "categories:write",
    "categories:delete",
    "variants:write",
    "variants:delete",
    "movements:write",
    "users:manage",
    "billing:manage",
  ],
  MANAGER: [
    "products:write",
    "products:delete",
    "categories:write",
    "categories:delete",
    "variants:write",
    "variants:delete",
    "movements:write",
  ],
  OPERATOR: ["movements:write"],
};

export function hasPermission(role: string, permission: Permission) {
  const key = role === "ADMIN" || role === "MANAGER" || role === "OPERATOR" ? role : "OPERATOR";
  return rolePermissions[key].includes(permission);
}
