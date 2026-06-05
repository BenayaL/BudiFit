import { useState } from "react";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileStats } from "./ProfileStats";
import { AchievementCard } from "./AchievementCard";
import { useUserProfile } from "./useUserProfile";
import { EditProfileForm } from "../EditProfile/EditProfileForm";

function UserProfilePage() {
  const { profile, isLoading, error } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading profile…</div>;
  }

  if (error || !profile) {
    return <div className="p-8 text-center text-red-500">{error || "Profile not found."}</div>;
  }

  const earnedCount = profile.achievements.filter((a) => a.earned).length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <ProfileHeader user={profile} onEditProfile={() => setIsEditing(true)} />

      <ProfileStats user={profile} earnedAchievementCount={earnedCount} />

      {isEditing && (
        <div className="mt-8">
          <EditProfileForm
            initialValues={{
              firstName: profile.firstName,
              lastName: profile.lastName,
              goals: profile.goals,
            }}
            onSaved={() => setIsEditing(false)}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {profile.achievements.map((badge) => (
            <AchievementCard key={badge.id} achievement={badge} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;
