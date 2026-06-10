// app = application entry and routing
// Page represents every named screen in the application.
// Using a union type prevents typos and gives autocomplete throughout the codebase.

export type Page =
  | "welcome"
  | "login"
  | "register"
  | "trainee-onboarding"
  | "home"
  | "chat"
  | "workout"
  | "generated-workout-plan-details"
  | "workout-history"
  | "dashboard"
  | "profile"
  | "settings"
  | "social"
  | "notifications"
  | "export"
  | "coach-dashboard"
  | "coach-trainees"
  | "coach-trainee-profile"
  | "coach-plans"
  | "coach-plan-review";
  
