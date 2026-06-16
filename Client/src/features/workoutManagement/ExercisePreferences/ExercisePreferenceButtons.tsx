import { useState } from "react";
import {
  EXERCISE_PREFERENCE_REASON_LABELS,
  type ExercisePreferenceReason,
  type ExercisePreferenceValue,
} from "./exercisePreference.models";

interface ExercisePreferenceButtonsProps {
  exerciseName: string;
  preference?: ExercisePreferenceValue;
  onSetPreference: (
    preference: ExercisePreferenceValue | null,
    reason?: ExercisePreferenceReason
  ) => void;
}

const REASON_OPTIONS = Object.entries(EXERCISE_PREFERENCE_REASON_LABELS) as [
  ExercisePreferenceReason,
  string
][];

export function ExercisePreferenceButtons({
  exerciseName,
  preference,
  onSetPreference,
}: ExercisePreferenceButtonsProps) {
  const [showReasonPicker, setShowReasonPicker] = useState(false);
  const isLiked = preference === "liked";
  const isDisliked = preference === "disliked";

  return (
    <div className="relative flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onSetPreference(isLiked ? null : "liked")}
        aria-label={isLiked ? `Remove like for ${exerciseName}` : `Like ${exerciseName}`}
        aria-pressed={isLiked}
        title={isLiked ? "Liked — click to remove" : "Like this exercise"}
        className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
          isLiked
            ? "border-rose-300 bg-rose-100 text-rose-600"
            : "border-slate-200 bg-white text-slate-400 hover:border-rose-200 hover:text-rose-400"
        }`}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M12 21s-7.5-4.5-9.5-9C1 8 2.5 4.5 6 4c2.2-.3 3.8 1 6 3 2.2-2 3.8-3.3 6-3 3.5.5 5 4 3.5 8-2 4.5-9.5 9-9.5 9z" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => {
          if (isDisliked) {
            onSetPreference(null);
            setShowReasonPicker(false);
          } else {
            setShowReasonPicker((v) => !v);
          }
        }}
        aria-label={isDisliked ? `Remove dislike for ${exerciseName}` : `Dislike ${exerciseName}`}
        aria-pressed={isDisliked}
        title={isDisliked ? "Disliked — click to remove" : "Dislike this exercise"}
        className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
          isDisliked
            ? "border-slate-400 bg-slate-200 text-slate-700"
            : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V3H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
          <path d="M17 3h2.67A2 2 0 0 1 22 5v7a2 2 0 0 1-2 2h-2.5" />
        </svg>
      </button>

      {showReasonPicker && (
        <div
          className="absolute right-0 top-9 z-10 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="px-2 py-1 text-xs font-bold text-slate-400">Why? (optional)</p>
          <button
            type="button"
            onClick={() => {
              onSetPreference("disliked");
              setShowReasonPicker(false);
            }}
            className="block w-full rounded-xl px-2 py-1.5 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            No reason
          </button>
          {REASON_OPTIONS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                onSetPreference("disliked", value);
                setShowReasonPicker(false);
              }}
              className="block w-full rounded-xl px-2 py-1.5 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ExercisePreferenceButtons;
