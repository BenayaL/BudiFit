import AppButton from "../../../common/AppButton/AppButton";
import { NotificationSettings } from "../NotificationSettings/NotificationSettings";
import { CoachConnection } from "../CoachConnection/CoachConnection";
import { useAuth } from "../../../app/AuthContext";
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

      {/* ── B. Notifications ─────────────────────────────────────────────── */}
      <SectionCard title="Notification preferences">
        <NotificationSettings />
      </SectionCard>

      {/* ── C. Coach connection ──────────────────────────────────────────── */}
      <SectionCard title="Coach connection">
        <CoachConnection />
      </SectionCard>
    </main>
  );
}

export default SettingsPage;
