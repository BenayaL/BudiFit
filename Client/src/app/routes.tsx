// app = application entry and routing
// This file will hold the route configuration when we migrate to React Router.
// For now, routing is handled via useState in App.tsx.

import type { Page } from "./app.types";

export const traineePages: Page[] = [
  "dashboard",
  "chat",
  "workout",
  "social",
  "profile",
  "notifications",
];

export const coachPages: Page[] = [
  "coach-dashboard",
  "coach-trainees",
  "coach-trainee-profile",
  "coach-plans",
  "coach-plan-review",
  "profile",
  "notifications",
];

export const mainAppPages: Page[] = [...traineePages, ...coachPages];
