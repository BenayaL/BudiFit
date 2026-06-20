import AppButton from "../../../common/AppButton/AppButton";
import { useNotificationSettings } from "./useNotificationSettings";

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-[#3B344A] dark:bg-[#2A2436]/50">
      <span className="text-sm font-semibold text-slate-700 dark:text-[#C9C4D6]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40 ${
          checked ? "bg-purple-600" : "bg-slate-300 dark:bg-[#3B344A]"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}

export function NotificationSettings() {
  const {
    settings,
    isLoading,
    isSaving,
    error,
    success,
    toggleNotification,
    setReminderTime,
    save,
  } = useNotificationSettings();

  if (isLoading) {
    return <p className="text-sm text-slate-500 dark:text-[#9E97AF]">Loading preferences…</p>;
  }

  const n = settings.notifications;

  return (
    <div className="space-y-3">
      <Toggle
        label="Daily workout reminder"
        checked={n.dailyWorkoutReminder}
        onChange={() => toggleNotification("dailyWorkoutReminder")}
      />
      <Toggle
        label="Coach messages"
        checked={n.coachMessages}
        onChange={() => toggleNotification("coachMessages")}
      />
      <Toggle
        label="Challenge updates"
        checked={n.challengeUpdates}
        onChange={() => toggleNotification("challengeUpdates")}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-[#3B344A] dark:bg-[#2A2436]/50">
        <label htmlFor="reminderTime" className="block text-sm font-semibold text-slate-700 dark:text-[#C9C4D6]">
          Daily reminder time
        </label>
        <input
          id="reminderTime"
          type="time"
          value={n.reminderTime}
          onChange={(e) => setReminderTime(e.target.value)}
          className="mt-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15 dark:border-[#3B344A] dark:bg-[#211D2B] dark:text-[#F8F7FB]"
        />
      </div>

      {error && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
          ✓ Preferences saved.
        </p>
      )}

      <AppButton
        type="button"
        variant="primary"
        onClick={save}
        disabled={isSaving}
        className="w-full"
      >
        {isSaving ? "Saving…" : "Save preferences"}
      </AppButton>
    </div>
  );
}

export default NotificationSettings;
