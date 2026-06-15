import type {
  CoachPlan,
  CoachPlanDay,
  CoachPlanExercise,
  CoachPlanDayUpdateBody,
  CoachPlanExerciseUpdateBody,
} from "../coach.models";
import type {
  EditablePlan,
  EditablePlanDay,
  EditablePlanExercise,
  PlanEditorValidationErrors,
  DayValidationErrors,
  ExerciseValidationErrors,
} from "./planEditor.types";

// ─── Normalize (server → editor) ─────────────────────────────────────────────

export function normalizePlan(plan: CoachPlan): EditablePlan {
  return {
    title: plan.title,
    description: plan.description,
    category: plan.category,
    difficulty: plan.difficulty,
    durationWeeks: plan.durationWeeks,
    workoutDaysPerWeek: plan.workoutDaysPerWeek,
    equipmentStr: plan.equipment.join(", "),
    days: plan.days.map(normalizeDay),
  };
}

function normalizeDay(day: CoachPlanDay): EditablePlanDay {
  return {
    clientId: crypto.randomUUID(),
    serverId: day.id || undefined,
    dayNumber: day.dayNumber,
    title: day.title,
    restDay: day.restDay,
    durationMinutes: day.durationMinutes,
    exercises: day.exercises.map(normalizeExercise),
  };
}

function normalizeExercise(ex: CoachPlanExercise): EditablePlanExercise {
  return {
    clientId: crypto.randomUUID(),
    serverId: ex.id || undefined,
    order: ex.order,
    name: ex.name,
    sets: ex.sets,
    reps: ex.reps,
    durationSec: ex.durationSec,
    restSec: ex.restSec,
    equipment: ex.equipment,
    notes: ex.notes,
  };
}

// ─── Serialize (editor → server) ─────────────────────────────────────────────

export function parseEquipment(equipmentStr: string): string[] {
  return equipmentStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function toApiDays(days: EditablePlanDay[]): CoachPlanDayUpdateBody[] {
  return days.map(
    (day): CoachPlanDayUpdateBody => ({
      ...(day.serverId ? { id: day.serverId } : {}),
      dayNumber: day.dayNumber,
      title: day.title,
      restDay: day.restDay,
      durationMinutes: day.durationMinutes,
      exercises: day.exercises.map(
        (ex): CoachPlanExerciseUpdateBody => ({
          ...(ex.serverId ? { id: ex.serverId } : {}),
          order: ex.order,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          durationSec: ex.durationSec,
          restSec: ex.restSec,
          equipment: ex.equipment,
          notes: ex.notes,
        })
      ),
    })
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────

const VALID_CATEGORIES = new Set([
  "strength",
  "hypertrophy",
  "endurance",
  "general_fitness",
  "mobility",
  "weight_loss",
]);

export function validateEditablePlan(
  plan: EditablePlan
): PlanEditorValidationErrors {
  const errors: PlanEditorValidationErrors = { dayErrors: {} };

  if (!plan.title.trim()) {
    errors.title = "Title is required.";
  } else if (plan.title.trim().length > 150) {
    errors.title = "Title must be 150 characters or fewer.";
  }

  if (plan.description.trim().length > 5000) {
    errors.description = "Description must be 5000 characters or fewer.";
  }

  if (!VALID_CATEGORIES.has(plan.category)) {
    errors.category = "Select a valid category.";
  }

  if (!Number.isInteger(plan.difficulty) || plan.difficulty < 1 || plan.difficulty > 5) {
    errors.difficulty = "Difficulty must be a whole number between 1 and 5.";
  }

  if (!Number.isInteger(plan.durationWeeks) || plan.durationWeeks < 1 || plan.durationWeeks > 12) {
    errors.durationWeeks = "Duration must be between 1 and 12 weeks.";
  }

  if (
    !Number.isInteger(plan.workoutDaysPerWeek) ||
    plan.workoutDaysPerWeek < 1 ||
    plan.workoutDaysPerWeek > 7
  ) {
    errors.workoutDaysPerWeek = "Workout days per week must be between 1 and 7.";
  }

  const equipment = parseEquipment(plan.equipmentStr);
  for (const item of equipment) {
    if (item.length > 100) {
      errors.equipment = "Each equipment item must be 100 characters or fewer.";
      break;
    }
  }

  if (plan.days.length < 1) {
    errors.days = "Plan must have at least one day.";
  } else if (plan.days.length > 7) {
    errors.days = "Plan cannot have more than 7 days.";
  } else if (!errors.workoutDaysPerWeek) {
    const nonRestCount = plan.days.filter((d) => !d.restDay).length;
    if (nonRestCount !== plan.workoutDaysPerWeek) {
      errors.workoutDaysPerWeek = `Workout days per week (${plan.workoutDaysPerWeek}) must equal the number of workout days in the schedule (${nonRestCount}).`;
    }
  }

  for (const day of plan.days) {
    const dayErr: DayValidationErrors = { exerciseErrors: {} };

    if (!day.title.trim()) {
      dayErr.title = "Day title is required.";
    }
    if (!day.restDay && day.durationMinutes < 1) {
      dayErr.durationMinutes = "Workout day must have a positive duration.";
    }
    if (day.restDay && day.exercises.length > 0) {
      dayErr.exercises = "Rest day cannot have exercises.";
    } else if (!day.restDay && day.exercises.length === 0) {
      dayErr.exercises = "Workout day must have at least one exercise.";
    }

    for (const ex of day.exercises) {
      const exErr: ExerciseValidationErrors = {};
      if (!ex.name.trim()) exErr.name = "Exercise name is required.";
      if (!ex.equipment.trim()) exErr.equipment = "Equipment is required.";
      if (
        ex.sets === undefined &&
        ex.reps === undefined &&
        ex.durationSec === undefined
      ) {
        exErr.execution = "Must include sets, reps, or duration.";
      }
      if (Object.keys(exErr).length > 0) {
        dayErr.exerciseErrors[ex.clientId] = exErr;
      }
    }

    if (
      dayErr.title ||
      dayErr.durationMinutes ||
      dayErr.exercises ||
      Object.keys(dayErr.exerciseErrors).length > 0
    ) {
      errors.dayErrors[day.clientId] = dayErr;
    }
  }

  return errors;
}

export function hasValidationErrors(errors: PlanEditorValidationErrors): boolean {
  if (
    errors.title ||
    errors.description ||
    errors.category ||
    errors.difficulty ||
    errors.durationWeeks ||
    errors.workoutDaysPerWeek ||
    errors.equipment ||
    errors.days
  ) {
    return true;
  }
  for (const dayErr of Object.values(errors.dayErrors)) {
    if (dayErr.title || dayErr.durationMinutes || dayErr.exercises) return true;
    if (Object.keys(dayErr.exerciseErrors).length > 0) return true;
  }
  return false;
}

// ─── Day operations ───────────────────────────────────────────────────────────

export function makeNewDay(days: EditablePlanDay[]): EditablePlanDay {
  const maxNum = days.reduce((m, d) => Math.max(m, d.dayNumber), 0);
  const num = maxNum + 1;
  return {
    clientId: crypto.randomUUID(),
    dayNumber: num,
    title: `Day ${num}`,
    restDay: false,
    durationMinutes: 45,
    exercises: [],
  };
}

export function removeDay(
  days: EditablePlanDay[],
  clientId: string
): EditablePlanDay[] {
  return days
    .filter((d) => d.clientId !== clientId)
    .map((d, i) => ({ ...d, dayNumber: i + 1 }));
}

// ─── Exercise operations ──────────────────────────────────────────────────────

export function makeNewExercise(
  exercises: EditablePlanExercise[]
): EditablePlanExercise {
  const maxOrder = exercises.reduce((m, e) => Math.max(m, e.order), 0);
  return {
    clientId: crypto.randomUUID(),
    order: maxOrder + 1,
    name: "",
    equipment: "No equipment",
    sets: 3,
    reps: "10",
  };
}

export function removeExercise(
  exercises: EditablePlanExercise[],
  clientId: string
): EditablePlanExercise[] {
  return exercises
    .filter((e) => e.clientId !== clientId)
    .map((e, i) => ({ ...e, order: i + 1 }));
}

export function duplicateExercise(
  exercises: EditablePlanExercise[],
  clientId: string
): EditablePlanExercise[] {
  const ex = exercises.find((e) => e.clientId === clientId);
  if (!ex) return exercises;
  const maxOrder = exercises.reduce((m, e) => Math.max(m, e.order), 0);
  const copy: EditablePlanExercise = {
    ...ex,
    clientId: crypto.randomUUID(),
    serverId: undefined,
    order: maxOrder + 1,
  };
  return [...exercises, copy];
}

export function moveExercise(
  exercises: EditablePlanExercise[],
  clientId: string,
  direction: "up" | "down"
): EditablePlanExercise[] {
  const idx = exercises.findIndex((e) => e.clientId === clientId);
  if (idx < 0) return exercises;
  const target = direction === "up" ? idx - 1 : idx + 1;
  if (target < 0 || target >= exercises.length) return exercises;
  const next = [...exercises];
  [next[idx], next[target]] = [next[target], next[idx]];
  return next.map((e, i) => ({ ...e, order: i + 1 }));
}
