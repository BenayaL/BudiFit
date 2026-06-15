import { useState } from "react";
import type { DailyPlanDay } from "./dailyWorkout.models";

interface DailyShareButtonProps {
  day: DailyPlanDay;
  date: string; // "YYYY-MM-DD"
  label?: string;
}

function buildShareText(day: DailyPlanDay, date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const dateLabel = new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const exercises = day.exercises
    .map((ex) => {
      let target = "";
      if (ex.sets !== undefined && ex.reps) target = ` — ${ex.sets} × ${ex.reps}`;
      else if (ex.reps) target = ` — ${ex.reps}`;
      else if (ex.durationSec !== undefined) target = ` — ${ex.durationSec}s`;
      return `• ${ex.name}${target}`;
    })
    .join("\n");

  return `💪 Today's Workout — ${dateLabel}\n${day.title}\n\n${exercises}\n\nTracked with BudiFit`;
}

export function DailyShareButton({ day, date, label }: DailyShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = buildShareText(day, date);

    if (navigator.share) {
      try {
        await navigator.share({ title: `Today's Workout — ${day.title}`, text });
        return;
      } catch {
        // User cancelled or share failed; fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard also failed — silent
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleShare()}
      title="Share today's workout"
      className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
    >
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          {label ?? "Share"}
        </>
      )}
    </button>
  );
}
