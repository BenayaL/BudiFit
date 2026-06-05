import { useState } from "react";
import { ProfileHeader } from "./ProfileHeader";
import { useUserProfile } from "./useUserProfile";
import { EditProfileForm } from "../EditProfile/EditProfileForm";

function UserProfilePage() {
  const { profile, isLoading, error } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading profile…</div>;
  if (error || !profile) return <div className="p-8 text-center text-red-500">{error || "Profile not found."}</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <ProfileHeader user={profile} onEditProfile={() => setIsEditing(true)} />

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
    </div>
  );
}

export default UserProfilePage;
