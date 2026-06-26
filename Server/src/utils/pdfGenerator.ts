// Shared PDF generation logic used by export.routes.ts.
// Each generator function resolves with the PDF as a Buffer so the
// caller can send it as a download attachment or email attachment.

import PDFDocument from "pdfkit";
import type { IUser } from "../models/user.model";
import type { IWorkout } from "../models/workout.model";
import type { IGeneratedWorkoutPlan, IGeneratedWorkoutDay } from "../models/generatedWorkoutPlan.model";

interface WorkoutSummaryStats {
  totalWorkouts: number;
  totalMinutes: number;
  currentStreak: number;
}

/**
 * Computes basic progress stats from a list of completed workouts.
 * Mirrors the logic used in progress.routes.ts so the PDF matches
 * what the user sees on their dashboard.
 */
export function computeWorkoutStats(completedWorkouts: IWorkout[]): WorkoutSummaryStats {
  const totalWorkouts = completedWorkouts.length;
  const totalMinutes  = completedWorkouts.reduce((sum, w) => sum + w.durationMinutes, 0);

  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const workoutDays = new Set(
    completedWorkouts.map((w) => {
      const d = new Date(w.scheduledAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  const DAY_MS = 86_400_000;
  let cursor = today.getTime();
  while (workoutDays.has(cursor)) {
    currentStreak++;
    cursor -= DAY_MS;
  }

  return { totalWorkouts, totalMinutes, currentStreak };
}

/**
 * Generates a workout summary PDF and resolves with the file as a Buffer.
 * Includes a header with the user's name, a stats overview, and a table
 * of completed workouts.
 */
export function generateWorkoutSummaryPdf(
  user: Pick<IUser, "firstName" | "lastName" | "email">,
  completedWorkouts: IWorkout[]
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const stats = computeWorkoutStats(completedWorkouts);

    // ─── Header ──────────────────────────────────────────────────────────────

    doc
      .fontSize(22)
      .fillColor("#6C63FF")
      .text("BudiFit Workout Summary", { align: "left" });

    doc
      .moveDown(0.3)
      .fontSize(11)
      .fillColor("#475569")
      .text(`${user.firstName} ${user.lastName} — ${user.email}`)
      .text(`Generated on ${new Date().toLocaleDateString()}`);

    doc.moveDown(1);

    // ─── Stats overview ──────────────────────────────────────────────────────

    doc
      .fontSize(14)
      .fillColor("#0f172a")
      .text("Overview", { underline: true });

    doc.moveDown(0.5);

    doc
      .fontSize(11)
      .fillColor("#0f172a")
      .text(`Total completed workouts: ${stats.totalWorkouts}`)
      .text(`Total time trained: ${Math.floor(stats.totalMinutes / 60)}h ${stats.totalMinutes % 60}m`)
      .text(`Current streak: ${stats.currentStreak} day${stats.currentStreak === 1 ? "" : "s"}`);

    doc.moveDown(1.5);

    // ─── Workout history table ──────────────────────────────────────────────

    doc
      .fontSize(14)
      .fillColor("#0f172a")
      .text("Workout History", { underline: true });

    doc.moveDown(0.5);

    if (completedWorkouts.length === 0) {
      doc
        .fontSize(11)
        .fillColor("#64748b")
        .text("No completed workouts yet — get moving!");
    } else {
      const tableTop = doc.y;
      const colDate = 50;
      const colTitle = 150;
      const colDuration = 420;

      doc
        .fontSize(10)
        .fillColor("#475569")
        .text("Date", colDate, tableTop)
        .text("Workout", colTitle, tableTop)
        .text("Duration", colDuration, tableTop);

      doc.moveDown(0.5);
      doc
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .strokeColor("#e2e8f0")
        .stroke();
      doc.moveDown(0.5);

      doc.fillColor("#0f172a");

      for (const workout of completedWorkouts) {
        const rowY = doc.y;

        // Start a new page if we're near the bottom
        if (rowY > 720) {
          doc.addPage();
        }

        const y = doc.y;
        doc
          .fontSize(10)
          .text(new Date(workout.scheduledAt).toLocaleDateString(), colDate, y, { width: 90 })
          .text(workout.title, colTitle, y, { width: 260 })
          .text(`${workout.durationMinutes} min`, colDuration, y, { width: 80 });

        doc.moveDown(0.7);
      }
    }

    doc.moveDown(2);
    doc
      .fontSize(9)
      .fillColor("#94a3b8")
      .text("Keep up the great work! — The BudiFit Team", { align: "center" });

    doc.end();
  });
}

// ─── Workout-plan PDF ─────────────────────────────────────────────────────────

export function generateWorkoutPlanPdf(
  user: Pick<IUser, "firstName" | "lastName" | "email">,
  plan: IGeneratedWorkoutPlan
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, autoFirstPage: true });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const PAGE_BOTTOM = 720;

    function ensureSpace(needed: number) {
      if (doc.y + needed > PAGE_BOTTOM) doc.addPage();
    }

    const categoryLabel = plan.category.replace(/_/g, " ");
    const difficultyLabel = `${plan.difficulty}/5`;

    // ─── Header ──────────────────────────────────────────────────────────────

    doc
      .fontSize(22)
      .fillColor("#6C63FF")
      .text("BudiFit Workout Plan", { align: "left" });

    doc
      .moveDown(0.3)
      .fontSize(11)
      .fillColor("#475569")
      .text(`${user.firstName} ${user.lastName} — ${user.email}`)
      .text(`Generated on ${new Date().toLocaleDateString()}`);

    doc.moveDown(1);

    // ─── Plan overview ───────────────────────────────────────────────────────

    doc
      .fontSize(14)
      .fillColor("#0f172a")
      .text(plan.title, { underline: true });

    doc.moveDown(0.4);

    doc
      .fontSize(11)
      .fillColor("#334155")
      .text(plan.description);

    doc.moveDown(0.8);

    const meta: [string, string][] = [
      ["Category",    categoryLabel],
      ["Difficulty",  difficultyLabel],
      ["Duration",    `${plan.durationWeeks} week${plan.durationWeeks === 1 ? "" : "s"}`],
      ["Days/week",   String(plan.workoutDaysPerWeek)],
      ["Equipment",   plan.equipment.length > 0 ? plan.equipment.join(", ") : "None"],
      ["Status",      plan.status],
    ];

    for (const [label, value] of meta) {
      doc
        .fontSize(10)
        .fillColor("#475569")
        .text(`${label}: `, { continued: true })
        .fillColor("#0f172a")
        .text(value);
    }

    doc.moveDown(1.5);

    // ─── Days ────────────────────────────────────────────────────────────────

    doc
      .fontSize(14)
      .fillColor("#0f172a")
      .text("Workout Days", { underline: true });

    doc.moveDown(0.5);

    const sortedDays = [...plan.days].sort((a, b) => a.dayNumber - b.dayNumber);

    for (const day of sortedDays) {
      ensureSpace(50);

      doc
        .fontSize(12)
        .fillColor("#6C63FF")
        .text(`Day ${day.dayNumber} — ${day.title}`);

      doc.moveDown(0.2);

      if (day.restDay) {
        doc
          .fontSize(10)
          .fillColor("#64748b")
          .text("Rest day");
      } else {
        doc
          .fontSize(10)
          .fillColor("#475569")
          .text(`Duration: ${day.durationMinutes} min`);

        doc.moveDown(0.3);

        const sortedEx = [...day.exercises].sort((a, b) => a.order - b.order);

        for (const ex of sortedEx) {
          ensureSpace(30);

          const parts: string[] = [ex.name];
          if (ex.sets) parts.push(`${ex.sets} sets`);
          if (ex.reps) parts.push(`${ex.reps} reps`);
          if (ex.durationSec) parts.push(`${ex.durationSec}s`);
          if (ex.restSec) parts.push(`${ex.restSec}s rest`);
          if (ex.equipment && ex.equipment !== "none") parts.push(`(${ex.equipment})`);

          doc
            .fontSize(10)
            .fillColor("#0f172a")
            .text(`  • ${parts.join(" · ")}`, { indent: 10 });

          if (ex.notes) {
            doc
              .fontSize(9)
              .fillColor("#64748b")
              .text(`     Note: ${ex.notes}`, { indent: 10 });
          }
        }
      }

      doc.moveDown(0.8);
    }

    doc.moveDown(1);
    doc
      .fontSize(9)
      .fillColor("#94a3b8")
      .text("Keep up the great work! — The BudiFit Team", { align: "center" });

    doc.end();
  });
}

// ─── Daily-workout PDF ───────────────────────────────────────────────────────

export function generateDailyWorkoutPdf(
  user: Pick<IUser, "firstName" | "lastName" | "email">,
  planTitle: string,
  day: IGeneratedWorkoutDay,
  date: string,
  isCompleted: boolean
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const PAGE_BOTTOM = 720;
    function ensureSpace(needed: number) {
      if (doc.y + needed > PAGE_BOTTOM) doc.addPage();
    }

    const formattedDate = new Date(date + "T00:00:00Z").toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // ─── Header ──────────────────────────────────────────────────────────────

    doc
      .fontSize(22)
      .fillColor("#6C63FF")
      .text("BudiFit Today's Workout", { align: "left" });

    doc
      .moveDown(0.3)
      .fontSize(11)
      .fillColor("#475569")
      .text(`${user.firstName} ${user.lastName} — ${user.email}`)
      .text(`Date: ${formattedDate}`);

    doc.moveDown(1);

    // ─── Day overview ────────────────────────────────────────────────────────

    doc
      .fontSize(14)
      .fillColor("#0f172a")
      .text(day.title, { underline: true });

    doc.moveDown(0.3);

    doc
      .fontSize(11)
      .fillColor("#475569")
      .text(`Plan: ${planTitle}`)
      .text(`Duration: ~${day.durationMinutes} min`)
      .text(`Exercises: ${day.exercises.length}`);

    if (isCompleted) {
      doc
        .moveDown(0.3)
        .fontSize(10)
        .fillColor("#16a34a")
        .text("✓ Completed");
    }

    doc.moveDown(1);

    // ─── Exercise list ───────────────────────────────────────────────────────

    doc
      .fontSize(14)
      .fillColor("#0f172a")
      .text("Exercises", { underline: true });

    doc.moveDown(0.5);

    const sortedEx = [...day.exercises].sort((a, b) => a.order - b.order);

    for (const ex of sortedEx) {
      ensureSpace(30);

      const parts: string[] = [ex.name];
      if (ex.sets) parts.push(`${ex.sets} sets`);
      if (ex.reps) parts.push(`${ex.reps} reps`);
      if (ex.durationSec) parts.push(`${ex.durationSec}s`);
      if (ex.restSec) parts.push(`${ex.restSec}s rest`);
      if (ex.equipment && ex.equipment !== "none") parts.push(`(${ex.equipment})`);

      doc
        .fontSize(10)
        .fillColor("#0f172a")
        .text(`• ${parts.join(" · ")}`, { indent: 10 });

      if (ex.notes) {
        doc
          .fontSize(9)
          .fillColor("#64748b")
          .text(`  Note: ${ex.notes}`, { indent: 10 });
      }

      doc.moveDown(0.4);
    }

    doc.moveDown(1.5);
    doc
      .fontSize(9)
      .fillColor("#94a3b8")
      .text("Keep up the great work! — The BudiFit Team", { align: "center" });

    doc.end();
  });
}

// ─── Workout-history PDF ──────────────────────────────────────────────────────

export function generateWorkoutHistoryPdf(
  user: Pick<IUser, "firstName" | "lastName" | "email">,
  completedPlans: IGeneratedWorkoutPlan[],
  completedWorkouts: IWorkout[]
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, autoFirstPage: true });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const PAGE_BOTTOM = 720;

    function ensureSpace(needed: number) {
      if (doc.y + needed > PAGE_BOTTOM) doc.addPage();
    }

    const totalSessionMinutes = completedWorkouts.reduce(
      (sum, w) => sum + w.durationMinutes,
      0
    );

    // ─── Header ──────────────────────────────────────────────────────────────

    doc
      .fontSize(22)
      .fillColor("#6C63FF")
      .text("BudiFit Workout History", { align: "left" });

    doc
      .moveDown(0.3)
      .fontSize(11)
      .fillColor("#475569")
      .text(`${user.firstName} ${user.lastName} — ${user.email}`)
      .text(`Exported on ${new Date().toLocaleDateString()}`);

    doc.moveDown(1);

    // ─── Summary stats ───────────────────────────────────────────────────────

    doc
      .fontSize(14)
      .fillColor("#0f172a")
      .text("Summary", { underline: true });

    doc.moveDown(0.5);

    doc
      .fontSize(11)
      .fillColor("#0f172a")
      .text(`Completed plans: ${completedPlans.length}`)
      .text(`Completed sessions: ${completedWorkouts.length}`)
      .text(
        `Total session time: ${Math.floor(totalSessionMinutes / 60)}h ${totalSessionMinutes % 60}m`
      );

    doc.moveDown(1.5);

    // ─── Completed workout plans ──────────────────────────────────────────────

    if (completedPlans.length > 0) {
      doc
        .fontSize(14)
        .fillColor("#0f172a")
        .text("Completed Workout Plans", { underline: true });

      doc.moveDown(0.5);

      for (const plan of completedPlans) {
        ensureSpace(60);

        const categoryLabel = plan.category.replace(/_/g, " ");
        const completedDate = plan.updatedAt
          ? new Date(plan.updatedAt).toLocaleDateString()
          : "—";

        doc
          .fontSize(12)
          .fillColor("#6C63FF")
          .text(plan.title);

        doc.moveDown(0.2);

        doc
          .fontSize(10)
          .fillColor("#475569")
          .text(
            `Category: ${categoryLabel} · Difficulty: ${plan.difficulty}/5 · ` +
              `Duration: ${plan.durationWeeks}w · Completed: ${completedDate}`
          );

        if (plan.description) {
          doc
            .moveDown(0.2)
            .fontSize(10)
            .fillColor("#334155")
            .text(plan.description);
        }

        doc.moveDown(0.4);

        const sortedDays = [...plan.days].sort((a, b) => a.dayNumber - b.dayNumber);

        for (const day of sortedDays) {
          ensureSpace(30);

          if (day.restDay) {
            doc
              .fontSize(10)
              .fillColor("#64748b")
              .text(`  Day ${day.dayNumber}: ${day.title} (rest)`, { indent: 10 });
          } else {
            doc
              .fontSize(10)
              .fillColor("#334155")
              .text(`  Day ${day.dayNumber}: ${day.title} — ${day.durationMinutes} min`, {
                indent: 10,
              });

            const sortedEx = [...day.exercises].sort((a, b) => a.order - b.order);

            for (const ex of sortedEx) {
              ensureSpace(20);

              const parts: string[] = [ex.name];
              if (ex.sets) parts.push(`${ex.sets} sets`);
              if (ex.reps) parts.push(`${ex.reps} reps`);
              if (ex.durationSec) parts.push(`${ex.durationSec}s`);
              if (ex.restSec) parts.push(`${ex.restSec}s rest`);

              doc
                .fontSize(9)
                .fillColor("#0f172a")
                .text(`    · ${parts.join(" · ")}`, { indent: 20 });
            }
          }
        }

        doc.moveDown(0.8);
      }
    }

    // ─── Completed workout sessions ───────────────────────────────────────────

    if (completedWorkouts.length > 0) {
      ensureSpace(40);

      doc
        .fontSize(14)
        .fillColor("#0f172a")
        .text("Completed Sessions", { underline: true });

      doc.moveDown(0.5);

      const tableTop = doc.y;
      const colDate  = 50;
      const colTitle = 160;
      const colDur   = 420;

      doc
        .fontSize(10)
        .fillColor("#475569")
        .text("Date",     colDate,  tableTop)
        .text("Session",  colTitle, tableTop)
        .text("Duration", colDur,   tableTop);

      doc.moveDown(0.5);
      doc
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .strokeColor("#e2e8f0")
        .stroke();
      doc.moveDown(0.5);

      doc.fillColor("#0f172a");

      for (const workout of completedWorkouts) {
        ensureSpace(25);

        const y = doc.y;
        doc
          .fontSize(10)
          .text(new Date(workout.scheduledAt).toLocaleDateString(), colDate,  y, { width: 100 })
          .text(workout.title,                                       colTitle, y, { width: 250 })
          .text(`${workout.durationMinutes} min`,                   colDur,   y, { width: 80 });

        doc.moveDown(0.7);
      }
    }

    doc.moveDown(2);
    doc
      .fontSize(9)
      .fillColor("#94a3b8")
      .text("Keep up the great work! — The BudiFit Team", { align: "center" });

    doc.end();
  });
}