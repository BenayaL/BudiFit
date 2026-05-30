// features/auth — interfaces = TypeScript structures that belong to the auth feature
// Add auth-specific object shapes here (API request/response bodies, session data, etc.)

// LoginRequest matches the body expected by POST /auth/login.
export interface LoginRequest {
  email: string;
  password: string;
}

// RegisterRequest matches the body expected by POST /auth/register.
export interface RegisterRequest {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

// AuthResponse is the shape returned by the auth microservice after a successful login.
export interface AuthResponse {
  token: string;
  userId: string;
}
