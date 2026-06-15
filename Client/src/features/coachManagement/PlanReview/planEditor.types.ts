// Editor-only types used inside PlanReviewPage.
// Never sent to the server — toApiDays() in planEditor.utils.ts converts
// EditablePlanDay[] → CoachPlanDayUpdateBody[] before any API call.

export interface EditablePlanExercise {
  /** React key. Stripped before API call. */
  clientId: string;
  /** MongoDB _id of this exercise if it already exists on the server. */
  serverId?: string;
  order: number;
  name: string;
  sets?: number;
  reps?: string;
  durationSec?: number;
  restSec?: number;
  equipment: string;
  notes?: string;
}

export interface EditablePlanDay {
  /** React key. Stripped before API call. */
  clientId: string;
  /** MongoDB _id of this day if it already exists on the server. */
  serverId?: string;
  dayNumber: number;
  title: string;
  restDay: boolean;
  durationMinutes: number;
  exercises: EditablePlanExercise[];
}

export interface EditablePlan {
  title: string;
  description: string;
  category: string;
  difficulty: number;
  durationWeeks: number;
  workoutDaysPerWeek: number;
  /** Comma-separated string; parsed to string[] before API call. */
  equipmentStr: string;
  days: EditablePlanDay[];
}

// ─── Validation error shapes ──────────────────────────────────────────────────

export interface ExerciseValidationErrors {
  name?: string;
  equipment?: string;
  /** Fires when sets, reps, and durationSec are all absent. */
  execution?: string;
}

export interface DayValidationErrors {
  title?: string;
  durationMinutes?: string;
  exercises?: string;
  exerciseErrors: Record<string, ExerciseValidationErrors>;
}

export interface PlanEditorValidationErrors {
  title?: string;
  description?: string;
  category?: string;
  difficulty?: string;
  durationWeeks?: string;
  workoutDaysPerWeek?: string;
  equipment?: string;
  days?: string;
  /** Keys are day.clientId. */
  dayErrors: Record<string, DayValidationErrors>;
}
