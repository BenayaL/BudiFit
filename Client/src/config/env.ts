// config = application-level configuration
// env.ts exposes environment variables in a typed, validated way.
// All process.env / import.meta.env reads should live here — not scattered in service files.

export const env = {
  // Base URL for all API requests. Set VITE_API_BASE_URL in .env to override.
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL as string | undefined ?? "",

  // Set to true in development builds automatically by Vite.
  IS_DEV: import.meta.env.DEV as boolean,
};
