import { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import { ProfileHeader } from "./ProfileHeader";
import { useUserProfile } from "./useUserProfile";
import { ModalPortal } from "../../../common/ModalPortal";
import { EditPersonalDetailsForm } from "../EditPersonalDetails/EditPersonalDetailsForm";
import { userService } from "../userService";
import { useAuth } from "../../../app/AuthContext";
import type { UserProfilePageProps } from "./UserProfile.types";
import type { TraineeProfileData } from "../user.models";

// ─── Display helpers ──────────────────────────────────────────────────────────

const EQUIPMENT_LABELS: Record<string, string> = {
  barbell: "Barbell",
  cables: "Cables",
  dumbbells: "Dumbbells",
  machines: "Machines",
  kettlebell: "Kettlebell",
  pullup: "Pull-up bar",
  smith: "Smith machine",
  bench: "Bench",
  rack: "Power rack",
  cardioMachines: "Cardio machines",
  trx: "TRX",
  bands: "Resistance bands",
};

const GENDER_LABELS: Record<string, string> = {
  male: "Male",
  female: "Female",
  prefer_not_to_say: "Prefer not to say",
};

const TIME_LABELS: Record<string, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

const MEDICAL_LABELS: Record<string, string> = {
  knee: "Knee",
  back: "Back",
  shoulder: "Shoulder",
  wrist_elbow: "Wrist / Elbow",
  hip_ankle: "Hip / Ankle",
  cardiovascular_breathing: "Cardiovascular",
  mobility_balance: "Mobility / Balance",
  other: "Other",
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-slate-100 py-2.5 last:border-0 dark:border-[#3B344A]">
      <span className="text-sm text-slate-500 dark:text-[#9E97AF]">{label}</span>
      <span className="text-sm font-semibold text-slate-800 dark:text-[#C9C4D6]">{value}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function UserProfilePage({ onLogout }: UserProfilePageProps) {
  const { user, isLoading, error } = useUserProfile();
  const { token } = useAuth();

  const [isEditingPersonalDetails, setIsEditingPersonalDetails] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [traineeProfile, setTraineeProfile] = useState<TraineeProfileData | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!token || !user || user.role !== "trainee") return;
    let cancelled = false;
    userService
      .getTraineeProfile(token)
      .then((res) => {
        if (!cancelled) setTraineeProfile(res.profile);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token, user, refreshKey]);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading profile…</div>;
  }

  if (error || !user) {
    return (
      <div className="p-8 text-center text-red-500">
        {error || "Profile not found."}
      </div>
    );
  }

  async function handleLogoutClick() {
    if (isLoggingOut || !onLogout) return;
    setIsLoggingOut(true);
    setLogoutError("");
    try {
      await onLogout();
    } catch (err) {
      setLogoutError(err instanceof Error ? err.message : "Logout failed. Please try again.");
      setIsLoggingOut(false);
    }
  }

  function handleSaved() {
    setIsEditingPersonalDetails(false);
    setRefreshKey((k) => k + 1);
  }

  const isTrainee = user.role === "trainee";
  const realConditions =
    traineeProfile?.medicalConditions.filter((c) => c !== "none") ?? [];

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      {/* ── Page header ────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-[#F8F7FB]">Profile</h1>
          <p className="mt-1 text-slate-500 dark:text-[#9E97AF]">
            Role:{" "}
            <span className="font-semibold capitalize text-purple-700">{user.role}</span>
          </p>
          {logoutError && (
            <p className="mt-2 text-sm font-medium text-red-600">{logoutError}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isTrainee && (
            <button
              type="button"
              onClick={() => setIsEditingPersonalDetails(true)}
              className="flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-100 dark:border-purple-800/50 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/40"
            >
              <Pencil size={16} />
              Edit personal details
            </button>
          )}
          {onLogout && (
            <button
              type="button"
              onClick={() => void handleLogoutClick()}
              disabled={isLoggingOut}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#3B344A] dark:bg-[#2A2436] dark:hover:border-red-800/50 dark:hover:bg-red-900/20"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {isLoggingOut ? "Logging out…" : "Log out"}
            </button>
          )}
        </div>
      </div>

      {/* ── Hero card ──────────────────────────────────────────────── */}
      <ProfileHeader user={user} />

      {/* ── Fitness goals ──────────────────────────────────────────── */}
      {user.goals.length > 0 && (
        <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-[#3B344A] dark:bg-[#211D2B]">
          <h2 className="mb-3 text-base font-extrabold text-slate-900 dark:text-[#F8F7FB]">Fitness goals</h2>
          <div className="flex flex-wrap gap-2">
            {user.goals.map((goal) => (
              <span
                key={goal}
                className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm font-semibold text-purple-700"
              >
                {capitalize(goal)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Trainee info cards ─────────────────────────────────────── */}
      {isTrainee && traineeProfile && (
        <>
          {/* Training summary */}
          <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-[#3B344A] dark:bg-[#211D2B]">
            <h2 className="mb-4 text-base font-extrabold text-slate-900 dark:text-[#F8F7FB]">Training summary</h2>
            <InfoRow label="Fitness level" value={capitalize(traineeProfile.fitnessLevel)} />
            <InfoRow label="Days per week" value={`${traineeProfile.weeklyWorkouts} days`} />
            <InfoRow label="Session duration" value={`${traineeProfile.sessionDurationMinutes} min`} />
            <InfoRow
              label="Preferred time"
              value={TIME_LABELS[traineeProfile.preferredWorkoutTime] ?? capitalize(traineeProfile.preferredWorkoutTime)}
            />
            {traineeProfile.availableEquipment.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#3B344A]">
                <p className="mb-2 text-sm text-slate-500 dark:text-[#9E97AF]">Available equipment</p>
                <div className="flex flex-wrap gap-2">
                  {traineeProfile.availableEquipment.map((eq) => (
                    <span
                      key={eq}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-[#3B344A] dark:bg-[#2A2436] dark:text-[#C9C4D6]"
                    >
                      {EQUIPMENT_LABELS[eq] ?? eq}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Body details */}
          <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-[#3B344A] dark:bg-[#211D2B]">
            <h2 className="mb-4 text-base font-extrabold text-slate-900 dark:text-[#F8F7FB]">Body details</h2>
            <InfoRow label="Age" value={`${traineeProfile.age} years`} />
            <InfoRow
              label="Gender"
              value={
                traineeProfile.gender
                  ? (GENDER_LABELS[traineeProfile.gender] ?? capitalize(traineeProfile.gender))
                  : "Not set"
              }
            />
            <InfoRow
              label="Height"
              value={traineeProfile.height !== undefined ? `${traineeProfile.height} cm` : "Not set"}
            />
            <InfoRow
              label="Weight"
              value={traineeProfile.weight !== undefined ? `${traineeProfile.weight} kg` : "Not set"}
            />
          </div>

          {/* Health & limitations */}
          <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm dark:border-[#3B344A] dark:bg-[#211D2B]">
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-[#F8F7FB]">Health &amp; limitations</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500 dark:bg-[#2A2436] dark:text-[#9E97AF]">
                Private
              </span>
            </div>
            {realConditions.length > 0 ? (
              <>
                <p className="mb-2 text-sm text-slate-600 dark:text-[#9E97AF]">
                  {realConditions.length} limitation{realConditions.length !== 1 ? "s" : ""} noted
                </p>
                <div className="flex flex-wrap gap-2">
                  {realConditions.map((c) => (
                    <span
                      key={c}
                      className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"
                    >
                      {MEDICAL_LABELS[c] ?? c}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500 dark:text-[#9E97AF]">No limitations selected</p>
            )}
            <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400 dark:border-[#3B344A] dark:text-[#9E97AF]">
              This information is used only to improve workout safety and recommendations.
            </p>
          </div>
        </>
      )}

      {/* ── Edit personal details modal ────────────────────────────── */}
      {isEditingPersonalDetails && (
        <ModalPortal>
          <div
            className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setIsEditingPersonalDetails(false)}
          >
            <div className="flex min-h-full items-start justify-center p-4 sm:p-8">
              <div
                className="relative w-full max-w-2xl rounded-3xl bg-[#fbfaf7] p-6 shadow-2xl sm:p-8 dark:bg-[#18161F]"
                onClick={(e) => e.stopPropagation()}
              >
                <EditPersonalDetailsForm
                  onSaved={handleSaved}
                  onCancel={() => setIsEditingPersonalDetails(false)}
                />
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}

export default UserProfilePage;
