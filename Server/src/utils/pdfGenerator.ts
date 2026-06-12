// Shared PDF generation logic for the workout summary export feature.
// Used by both the "download" and "email" routes in export.routes.ts
// so the PDF content stays consistent in both places.

import PDFDocument from "pdfkit";
import type { IUser } from "../models/user.model";
import type { IWorkout } from "../models/workout.model";

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