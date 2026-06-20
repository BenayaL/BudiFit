import AppButton from "../../../common/AppButton/AppButton";
import { NotificationSettings } from "../NotificationSettings/NotificationSettings";
import { CoachConnection } from "../CoachConnection/CoachConnection";
import { useAuth } from "../../../app/AuthContext";
import { useTheme } from "../../../app/useTheme";
import type { SettingsPageProps } from "./Settings.types";

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-[#3B344A] dark:bg-[#211D2B]">
      <h2 className="text-lg font-extrabold text-slate-900 dark:text-[#F8F7FB]">{title}</h2>
      {description && (
        <p className="mt-1 mb-5 text-sm text-slate-500 dark:text-[#9E97AF]">{description}</p>
      )}
      {!description && <div className="mb-5" />}
      {children}
    </section>
  );
}

function AppearanceControl() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-100 p-1 dark:border-[#3B344A] dark:bg-[#2A2436]/60">
      {(["light", "dark"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setTheme(option)}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-150 ${
            theme === option
              ? "bg-white text-slate-900 shadow-sm dark:bg-[#2A2436] dark:text-white"
              : "text-slate-500 hover:text-slate-700 dark:text-[#9E97AF] dark:hover:text-slate-200"
          }`}
        >
          {option === "light" ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
          <span className="capitalize">{option}</span>
        </button>
      ))}
    </div>
  );
}

function SettingsPage({ onGoToProfile }: Omit<SettingsPageProps, "onLogout">) {
  const { user } = useAuth();

  if (!user) return null;

  const roleLabel = user.role === "coach" ? "Coach" : "Trainee";

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-6 py-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-[#F8F7FB]">Settings</h1>
        <p className="mt-1 text-slate-500 dark:text-[#9E97AF]">Manage your account and preferences.</p>
      </div>

      {/* ── A. Account ──────────────────────────────────────────────────── */}
      <SectionCard title="Account">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 text-xl font-extrabold text-white">
            {user.firstName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-extrabold text-slate-900 dark:text-[#F8F7FB]">
              {user.firstName} {user.lastName}
            </p>
            <p className="truncate text-sm text-slate-500 dark:text-[#9E97AF]">{user.email}</p>
            <span className="mt-1 inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              {roleLabel}
            </span>
          </div>
        </div>
        <div className="mt-4">
          <AppButton variant="secondary" onClick={onGoToProfile}>
            View &amp; edit profile →
          </AppButton>
        </div>
      </SectionCard>

      {/* ── B. Appearance ────────────────────────────────────────────────── */}
      <SectionCard title="Appearance" description="Choose your preferred app appearance.">
        <AppearanceControl />
      </SectionCard>

      {/* ── C. Notifications ─────────────────────────────────────────────── */}
      <SectionCard title="Notification preferences">
        <NotificationSettings />
      </SectionCard>

      {/* ── D. Coach connection ──────────────────────────────────────────── */}
      <SectionCard title="Coach connection">
        <CoachConnection />
      </SectionCard>
    </main>
  );
}

export default SettingsPage;
