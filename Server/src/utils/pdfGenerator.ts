// Shared PDF generation logic used by export.routes.ts.
// Each generator function resolves with the PDF as a Buffer so the
// caller can send it as a download attachment or email attachment.

import PDFDocument from "pdfkit";
import type { IUser } from "../models/user.model";
import type { IDailyWorkoutLog } from "../models/dailyWorkoutLog.model";
import type { IGeneratedWorkoutPlan, IGeneratedWorkoutDay } from "../models/generatedWorkoutPlan.model";

// Date helpers (mirrors progress.routes.ts logic so stats match the dashboard).
function _dayStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function _prevDay(s: string): string {
  const d = new Date(s + "T12:00:00"); d.setDate(d.getDate() - 1); return _dayStr(d);
}
function _nextDay(s: string): string {
  const d = new Date(s + "T12:00:00"); d.setDate(d.getDate() + 1); return _dayStr(d);
}

export function generateWorkoutSummaryPdf(
  user: Pick<IUser, "firstName" | "lastName" | "email">,
  logs: IDailyWorkoutLog[]
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ── Stats (mirrors progress.routes.ts /dashboard logic) ──────────────────

    const totalWorkouts = logs.length;
    const totalMinutes  = logs.reduce((sum, l) => sum + (l.durationMinutes ?? 0), 0);

    const distinctDates = [...new Set(logs.map((l) => l.workoutDate))].sort();
    const dateSet = new Set(distinctDates);

    const today     = _dayStr(new Date());
    const yesterday = _prevDay(today);

    let currentStreak = 0;
    let cursor: string | null = dateSet.has(today) ? today : dateSet.has(yesterday) ? yesterday : null;
    while (cursor !== null && dateSet.has(cursor)) { currentStreak++; cursor = _prevDay(cursor); }

    let longestStreak = distinctDates.length > 0 ? 1 : 0;
    let run = longestStreak;
    for (let i = 1; i < distinctDates.length; i++) {
      run = _nextDay(distinctDates[i - 1]) === distinctDates[i] ? run + 1 : 1;
      if (run > longestStreak) longestStreak = run;
    }
    longestStreak = Math.max(longestStreak, currentStreak);

    // ── Header ────────────────────────────────────────────────────────────────

    doc
      .fontSize(22)
      .fillColor("#6C63FF")
      .text("BudiFit Progress Summary", { align: "left" });

    doc
      .moveDown(0.3)
      .fontSize(11)
      .fillColor("#475569")
      .text(`${user.firstName} ${user.lastName} — ${user.email}`)
      .text(`Generated on ${new Date().toLocaleDateString()}`);

    doc.moveDown(1);

    // ── Stats overview ────────────────────────────────────────────────────────

    doc
      .fontSize(14)
      .fillColor("#0f172a")
      .text("Overview", { underline: true });

    doc.moveDown(0.5);

    doc
      .fontSize(11)
      .fillColor("#0f172a")
      .text(`Total completed workouts: ${totalWorkouts}`)
      .text(`Total time trained: ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`)
      .text(`Current streak: ${currentStreak} day${currentStreak === 1 ? "" : "s"}`)
      .text(`Longest streak: ${longestStreak} day${longestStreak === 1 ? "" : "s"}`);

    doc.moveDown(1.5);

    // ── Completed sessions ────────────────────────────────────────────────────

    doc
      .fontSize(14)
      .fillColor("#0f172a")
      .text("Completed Sessions", { underline: true });

    doc.moveDown(0.5);

    if (logs.length === 0) {
      doc
        .fontSize(11)
        .fillColor("#64748b")
        .text("No completed workouts yet — get moving!");
    } else {
      const tableTop    = doc.y;
      const colDate     = 50;
      const colSession  = 150;
      const colDuration = 420;

      doc
        .fontSize(10)
        .fillColor("#475569")
        .text("Date",     colDate,     tableTop)
        .text("Session",  colSession,  tableTop)
        .text("Duration", colDuration, tableTop);

      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#e2e8f0").stroke();
      doc.moveDown(0.5);
      doc.fillColor("#0f172a");

      for (const log of logs) {
        if (doc.y > 720) doc.addPage();

        const y = doc.y;
        const sessionLabel = log.planTitle && log.dayTitle
          ? `${log.planTitle} — ${log.dayTitle}`
          : log.dayTitle || "Workout";

        doc
          .fontSize(10)
          .text(log.workoutDate, colDate,     y, { width: 90 })
          .text(sessionLabel,    colSession,  y, { width: 260 })
          .text(`${log.durationMinutes} min`, colDuration, y, { width: 80 });

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
  dailyLogs: IDailyWorkoutLog[]
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

    const totalSessionMinutes = dailyLogs.reduce(
      (sum, l) => sum + (l.durationMinutes ?? 0),
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
      .text(`Completed daily sessions: ${dailyLogs.length}`)
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

    if (dailyLogs.length > 0) {
      ensureSpace(40);

      doc
        .fontSize(14)
        .fillColor("#0f172a")
        .text("Completed Daily Sessions", { underline: true });

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

      for (const log of dailyLogs) {
        ensureSpace(25);

        const y = doc.y;
        const sessionLabel = log.planTitle && log.dayTitle
          ? `${log.planTitle} — ${log.dayTitle}`
          : log.dayTitle || "Workout";

        doc
          .fontSize(10)
          .text(log.workoutDate,  colDate,  y, { width: 100 })
          .text(sessionLabel,     colTitle, y, { width: 250 })
          .text(`${log.durationMinutes} min`, colDur, y, { width: 80 });

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