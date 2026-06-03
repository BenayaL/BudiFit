import type { User } from "../interfaces/user.interfaces";

// Compose a display name from the stored parts.
export function getFullName(user: Pick<User, "firstName" | "lastName">): string {
  return `${user.firstName} ${user.lastName}`.trim();
}