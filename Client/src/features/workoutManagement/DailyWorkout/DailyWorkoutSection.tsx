import { useState } from "react";
import { useDailyWorkout } from "./useDailyWorkout";
import { TodayWorkoutCard } from "./TodayWorkoutCard";
import { TomorrowWorkoutCard } from "./TomorrowWorkoutCard";
import { StreakBadge } from "./StreakBadge";
import { WorkoutCalendar } from "./WorkoutCalendar";
import { DailyWorkoutDetailsModal } from "./DailyWorkoutDetailsModal";
import { DailyWorkoutHistoryModal } from "./DailyWorkoutHistoryModal";
import { DailyShareButton } from "./DailyShareButton";
import type { DailyPlanDay, DailyDashboard } from "./dailyWorkout.models";

type ModalMode =
  | { kind: "details"; day: DailyPlanDay; dateLabel: string; label: "Today" | "Tomorrow" }
  | { kind: "history" }
  | null;

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function DailyWorkoutSection() {
  const { dashboard, isLoading, isCompleting, error, completeToday, refresh } =
    useDailyWorkout();

  const [modal, setModal] = useState<ModalMode>(null);
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0);

  const handleMarkDone = async () => {
    const ok = await completeToday();
    if (ok) setCalendarRefreshKey((k) => k + 1);
  };

  // Derive today's workout day for the Share button (available before full UI renders)
  const todayEntry = dashboard?.today;
  const todayPlanDay =
    todayEntry?.planDay && !todayEntry.planDay.restDay
      ? todayEntry.planDay
      : null;

  return (
    <div>
      {/* ── Persistent section header ── */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-extrabold text-slate-900">
          Daily Workouts
        </h2>

        <div className="flex shrink-0 flex-wrap gap-3">
          {/* Workout History — always available */}
          <button
            type="button"
            onClick={() => setModal({ kind: "history" })}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Workout History
          </button>

          {/* Share Today's Workout — only when today has a real workout */}
          {todayPlanDay && todayEntry && (
            <DailyShareButton
              day={todayPlanDay}
              date={todayEntry.date}
              label="Share Today's Workout"
            />
          )}
        </div>
      </div>

      {/* ── Content area ── */}
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600" />
        </div>
      ) : error && !dashboard ? (
        /* Initial load failed — show error with retry */
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="font-semibold text-red-700">{error}</p>
          <button
            type="button"
            onClick={refresh}
            className="mt-4 rounded-2xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      ) : !dashboard?.activePlan ? (
        /* No active plan */
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-slate-500">
            Generate a workout plan below to start tracking your daily workouts.
          </p>
        </div>
      ) : (
        /* Full daily workout UI */
        <ActivePlanUI
          dashboard={dashboard as DailyDashboard & { activePlan: NonNullable<DailyDashboard["activePlan"]> }}
          isCompleting={isCompleting}
          error={error}
          calendarRefreshKey={calendarRefreshKey}
          onMarkDone={() => void handleMarkDone()}
          onOpenDetails={(day, dateLabel, label) =>
            setModal({ kind: "details", day, dateLabel, label })
          }
        />
      )}

      {/* ── Modals — rendered outside content area so they're always reachable ── */}
      {modal?.kind === "details" && (
        <DailyWorkoutDetailsModal
          day={modal.day}
          dateLabel={modal.dateLabel}
          label={modal.label}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.kind === "history" && (
        <DailyWorkoutHistoryModal onClose={() => setModal(null)} />
      )}
    </div>
  );
}

// ─── Sub-component: renders when an active plan exists ────────────────────────

interface ActivePlanUIProps {
  dashboard: DailyDashboard & { activePlan: NonNullable<DailyDashboard["activePlan"]> };
  isCompleting: boolean;
  error: string;
  calendarRefreshKey: number;
  onMarkDone: () => void;
  onOpenDetails: (
    day: DailyPlanDay,
    dateLabel: string,
    label: "Today" | "Tomorrow"
  ) => void;
}

function ActivePlanUI({
  dashboard,
  isCompleting,
  error,
  calendarRefreshKey,
  onMarkDone,
  onOpenDetails,
}: ActivePlanUIProps) {
  const { today, tomorrow, streak, activePlan } = dashboard;

  return (
    <>
      {/* Per-action error banner (e.g. "Mark as Done" failed) */}
      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* Today + Tomorrow + Streak in one row */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
        <TodayWorkoutCard
          today={today}
          activePlan={activePlan}
          isCompleting={isCompleting}
          onMarkDone={onMarkDone}
          onViewDetails={() => {
            const day = today.planDay;
            if (!day || day.restDay) return;
            onOpenDetails(day, formatDate(today.date), "Today");
          }}
        />

        <TomorrowWorkoutCard
          tomorrow={tomorrow}
          onViewDetails={() => {
            const day = tomorrow.planDay;
            if (!day || day.restDay) return;
            onOpenDetails(day, formatDate(tomorrow.date), "Tomorrow");
          }}
        />

        <StreakBadge streak={streak} />
      </div>

      {/* Calendar */}
      <div className="mt-6">
        <WorkoutCalendar refreshKey={calendarRefreshKey} />
      </div>
    </>
  );
}
