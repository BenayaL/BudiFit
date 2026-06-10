import { useState } from "react";
import { ProfileHeader } from "./ProfileHeader";
import { useUserProfile } from "./useUserProfile";
import { EditProfileForm } from "../EditProfile/EditProfileForm";
import type { UserProfilePageProps } from "./UserProfile.types";
import type { Goal } from "../user.models";

function UserProfilePage({ onGoToSettings }: UserProfilePageProps) {
  const { user, isLoading, error } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);

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

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Profile</h1>
          <p className="mt-1 text-slate-500">
            Role: <span className="font-semibold capitalize text-purple-700">{user.role}</span>
          </p>
        </div>
        {onGoToSettings && (
          <button
            type="button"
            onClick={onGoToSettings}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Settings
          </button>
        )}
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

      {/* Edit form */}
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
