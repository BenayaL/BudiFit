// app = application entry and routing
// This file will hold the route configuration when we migrate to React Router.
// For now, routing is handled via useState in App.tsx.

import type { Page } from "./app.types";

// mainAppPages lists all pages that live behind the logged-in layout (TopNav visible).
// Auth and public pages (welcome, login, register) are intentionally excluded.
export const mainAppPages: Page[] = [
  "home",
  "chat",
  "workout",
  "dashboard",
  "profile",
  "social",
  "notifications",
  "export",
];
