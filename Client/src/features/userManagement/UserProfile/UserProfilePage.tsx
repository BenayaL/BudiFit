import { useState } from "react";
import { Pencil } from "lucide-react";
import { ProfileHeader } from "./ProfileHeader";
import { useUserProfile } from "./useUserProfile";
import { EditProfileForm } from "../EditProfile/EditProfileForm";
import type { UserProfilePageProps } from "./UserProfile.types";
import type { Goal } from "../user.models";

function UserProfilePage({ onLogout, onEditPersonalDetails }: UserProfilePageProps) {
  const { user, isLoading, error } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

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

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Profile</h1>
          <p className="mt-1 text-slate-500">
            Role: <span className="font-semibold capitalize text-purple-700">{user.role}</span>
          </p>
          {logoutError && (
            <p className="mt-2 text-sm font-medium text-red-600">{logoutError}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {user.role === "trainee" && onEditPersonalDetails && (
            <button
              type="button"
              onClick={onEditPersonalDetails}
              className="flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-100"
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
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:border-red-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
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

      <ProfileHeader user={user} onEditProfile={() => setIsEditing(true)} />

      {/* Goals */}
      {user.goals.length > 0 && (
        <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-base font-extrabold text-slate-900">Fitness goals</h2>
          <div className="flex flex-wrap gap-2">
            {user.goals.map((goal) => (
              <span
                key={goal}
                className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm font-semibold text-purple-700"
              >
                {goal}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Edit name / goals form */}
      {isEditing && (
        <div className="mt-6">
          <EditProfileForm
            initialValues={{
              firstName: user.firstName,
              lastName: user.lastName,
              goals: user.goals as Goal[],
            }}
            onSaved={() => setIsEditing(false)}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      )}
    </div>
  );
}

export default UserProfilePage;
