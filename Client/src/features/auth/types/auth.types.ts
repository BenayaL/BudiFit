// features/auth — types = TypeScript structures that belong to the auth feature
// Add auth-specific primitive types and union types here.

// AuthStatus represents the possible states of the authentication flow.
export type AuthStatus = "idle" | "loading" | "success" | "error";
