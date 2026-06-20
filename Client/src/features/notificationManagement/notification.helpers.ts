// notificationManagement — shared helpers for display, settings, and action routing.

import { Bell, Users, Activity, Info, Clock, TrendingUp } from "lucide-react";
import type React from "react";
import type { Notification } from "./notification.models";
import type { NotificationSettings } from "../userManagement/user.models";
import type { Page } from "../../app/app.types";

// ─── Category display config ──────────────────────────────────────────────────

type CategoryConfig = {
  Icon: React.ElementType;
  bg: string;
  iconColor: string;
  borderColor: string;
};

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  coach_action:     { Icon: Users,      bg: "bg-purple-100 dark:bg-purple-900/30",  iconColor: "text-purple-600 dark:text-purple-400",  borderColor: "border-l-purple-500" },
  trainee_update:   { Icon: Activity,   bg: "bg-emerald-100 dark:bg-emerald-900/30", iconColor: "text-emerald-600 dark:text-emerald-400", borderColor: "border-l-emerald-500" },
  system:           { Icon: Info,       bg: "bg-slate-100 dark:bg-[#2A2436]",        iconColor: "text-slate-500 dark:text-[#9E97AF]",    borderColor: "border-l-slate-400 dark:border-l-[#3B344A]" },
  workout_reminder: { Icon: Clock,      bg: "bg-amber-100 dark:bg-amber-900/30",     iconColor: "text-amber-600 dark:text-amber-400",    borderColor: "border-l-amber-500" },
  progress:         { Icon: TrendingUp, bg: "bg-blue-100 dark:bg-blue-900/30",       iconColor: "text-blue-600 dark:text-blue-400",      borderColor: "border-l-blue-500" },
};

const DEFAULT_CATEGORY_CONFIG: CategoryConfig = {
  Icon: Bell,
  bg: "bg-slate-100 dark:bg-[#2A2436]",
  iconColor: "text-slate-500 dark:text-[#9E97AF]",
  borderColor: "border-l-slate-300 dark:border-l-[#3B344A]",
};

// Explicit if/else avoids the (category && map[category]) ?? default pattern
// which can return "" when category is an empty string (falsy but not null/undefined).
export function getCategoryConfig(category?: string): CategoryConfig {
  if (category && CATEGORY_CONFIG[category]) {
    return CATEGORY_CONFIG[category];
  }
  return DEFAULT_CATEGORY_CONFIG;
}

// ─── Type labels ──────────────────────────────────────────────────────────────

export const TYPE_LABELS: Partial<Record<Notification["type"], string>> = {
  plan_pending_review:    "Plan waiting for review",
  plan_approved:          "Plan approved",
  plan_deleted_by_coach:  "Plan removed",
  plan_edited_by_coach:   "Plan updated by coach",
  plan_change_requested:  "Change request from trainee",
  plan_change_resolved:   "Change request completed",
  plan_change_rejected:   "Change request declined",
  plan_generated_by_coach:"New plan from your coach",
  coach_disconnected:     "Disconnected from coach",
  trainee_connected:      "New trainee connected",
  trainee_disconnected:   "Trainee disconnected",
  ai_plan_generated:      "Your AI workout plan is ready",
  ai_plan_replaced:       "Your replacement plan is ready",
  today_workout_ready:    "Today's workout is ready",
  workout_completed:      "Workout completed",
  streak_milestone:       "Streak milestone",
  missed_workout:         "Workout missed",
  no_active_plan:         "Ready for a new plan?",
};

export function getNotificationTitle(n: Notification): string {
  return n.title ?? TYPE_LABELS[n.type] ?? n.type;
}

// ─── Action label ─────────────────────────────────────────────────────────────

export function getNotificationActionLabel(n: Notification): string {
  switch (n.type) {
    case "plan_pending_review":    return "Review plan";
    case "trainee_connected":      return "View trainee";
    case "plan_change_requested":  return "Review request";
    case "plan_approved":          return "Open workout plan";
    case "plan_edited_by_coach":   return "View updated plan";
    case "plan_generated_by_coach":return "View plan status";
    case "plan_deleted_by_coach":  return "Go to workouts";
    case "plan_change_resolved":   return "View updated plan";
    case "plan_change_rejected":   return "Open plan";
    case "coach_disconnected":     return "Go to workouts";
    case "trainee_disconnected":   return "View trainees";
    case "ai_plan_generated":      return "Open workout plan";
    case "ai_plan_replaced":       return "View new plan";
    case "today_workout_ready":    return "Start workout";
    case "workout_completed":      return "View progress";
    case "streak_milestone":       return "View progress";
    case "missed_workout":         return "Open workout";
    case "no_active_plan":         return "Generate plan";
    default:                       return "View";
  }
}

// ─── Action routing ───────────────────────────────────────────────────────────

export interface NotificationActionCallbacks {
  onChangePage: (page: Page) => void;
  onReviewPlan: (planId: string) => void;
  onViewTraineeProfile: (traineeId: string) => void;
}

// Fallback page targets for notifications that may lack an actionUrl
// (e.g. records created before actionUrl was added to the schema).
const FALLBACK_PAGES: Partial<Record<Notification["type"], Page>> = {
  plan_approved:          "workout",
  plan_edited_by_coach:   "workout",
  plan_generated_by_coach:"workout",
  plan_deleted_by_coach:  "workout",
  plan_change_resolved:   "workout",
  plan_change_rejected:   "workout",
  plan_change_requested:  "coach-plans",
  coach_disconnected:     "workout",
  trainee_disconnected:   "coach-trainees",
  ai_plan_generated:      "workout",
  ai_plan_replaced:       "workout",
  today_workout_ready:    "workout",
  missed_workout:         "workout",
  workout_completed:      "dashboard",
  streak_milestone:       "dashboard",
  no_active_plan:         "workout",
};

export function isNotificationActionable(n: Notification): boolean {
  if (n.actionUrl) return true;
  // plan_pending_review always navigable (to review if planId present, else to coach-plans)
  if (n.type === "plan_pending_review") return true;
  // trainee_connected requires traineeId for profile navigation
  if (n.type === "trainee_connected") return !!n.traineeId;
  // All other types with a known fallback page
  return n.type in FALLBACK_PAGES;
}

export function executeNotificationAction(
  n: Notification,
  callbacks: NotificationActionCallbacks
): void {
  // actionUrl takes priority — use it when present
  if (n.actionUrl === "coach-plan-review" && n.planId) {
    callbacks.onReviewPlan(n.planId);
    return;
  }
  if (n.actionUrl === "coach-trainee-profile" && n.traineeId) {
    callbacks.onViewTraineeProfile(n.traineeId);
    return;
  }
  if (n.actionUrl) {
    callbacks.onChangePage(n.actionUrl as Page);
    return;
  }

  // Fallback: infer target from type + available IDs
  if (n.type === "plan_pending_review") {
    if (n.planId) {
      callbacks.onReviewPlan(n.planId);
    } else {
      callbacks.onChangePage("coach-plans");
    }
    return;
  }
  if (n.type === "trainee_connected" && n.traineeId) {
    callbacks.onViewTraineeProfile(n.traineeId);
    return;
  }
  const page = FALLBACK_PAGES[n.type];
  if (page) {
    callbacks.onChangePage(page);
  }
}

export function isActionNeeded(n: Notification): boolean {
  return !!n.actionUrl || n.priority === "high" || n.category === "coach_action";
}

// ─── Settings: which types each toggle controls ───────────────────────────────

const COACH_MESSAGE_TYPES = new Set<Notification["type"]>([
  "trainee_connected",
  "trainee_disconnected",
  "plan_pending_review",
  "plan_approved",
  "plan_deleted_by_coach",
  "plan_edited_by_coach",
  "plan_change_requested",
  "plan_change_resolved",
  "plan_change_rejected",
  "plan_generated_by_coach",
  "coach_disconnected",
]);

const CHALLENGE_TYPES = new Set<Notification["type"]>([
  "workout_completed",
  "streak_milestone",
  "no_active_plan",
  "ai_plan_generated",
  "ai_plan_replaced",
]);

const REMINDER_TYPES = new Set<Notification["type"]>([
  "today_workout_ready",
  "missed_workout",
]);

export function shouldShowNotificationToast(
  n: Notification,
  settings: NotificationSettings
): boolean {
  if (REMINDER_TYPES.has(n.type))      return settings.dailyWorkoutReminder !== false;
  if (COACH_MESSAGE_TYPES.has(n.type)) return settings.coachMessages !== false;
  if (CHALLENGE_TYPES.has(n.type))     return settings.challengeUpdates !== false;
  return true;
}

// ─── Reminder time gate (today_workout_ready only) ────────────────────────────

export function isAfterReminderTime(settings: NotificationSettings): boolean {
  const reminderTime = settings.reminderTime ?? "08:00";
  const [rh, rm] = reminderTime.split(":").map(Number);
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const reminderMinutes = (rh ?? 8) * 60 + (rm ?? 0);
  return nowMinutes >= reminderMinutes;
}
