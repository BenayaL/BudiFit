import { useState } from "react";
import type { CurrentUser } from "../user.models";
import { useAuth } from "../../../app/AuthContext";
import { userService } from "../userService";
import AvatarModal from "./AvatarModal";

interface ProfileHeaderProps {
  user: CurrentUser;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const { token, updateCurrentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | undefined>();

  const fitnessLevelLabel = user.fitnessLevel
    ? user.fitnessLevel.charAt(0).toUpperCase() + user.fitnessLevel.slice(1)
    : null;

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const displayAvatar = user.avatarIcon || user.firstName.charAt(0).toUpperCase();

  async function handleSelectAvatar(avatar: string) {
    if (!token) return;
    setIsSaving(true);
    setSaveError(undefined);
    try {
      const updatedUser = await userService.updateAvatar(avatar, token);
      updateCurrentUser(updatedUser);
      setIsModalOpen(false);
    } catch {
      setSaveError("Failed to save avatar. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-[24px] bg-slate-900 shadow-lg">
      <div className="h-32 w-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-orange-400 opacity-90" />

      <div className="-mt-12 relative z-10 flex flex-col gap-6 px-8 pb-8 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
          <div
            onClick={() => { setSaveError(undefined); setIsModalOpen(true); }}
            className="group relative flex h-24 w-24 cursor-pointer items-center justify-center rounded-full border-4 border-slate-900 bg-purple-600 text-4xl font-extrabold text-white shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
            title="Click to change avatar"
            role="button"
            aria-label="Change avatar"
          >
            {displayAvatar}
            <span className="absolute bottom-0 right-0 rounded-full border border-purple-500 bg-slate-800 p-1 text-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              ✏️
            </span>
          </div>

          <div className="mb-1 translate-y-4 text-white">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Active now
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              {user.firstName} {user.lastName}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              @{user.username}
              {fitnessLevelLabel ? ` · ${fitnessLevelLabel}` : ""}
              {" · "}Joined {memberSince}
            </p>
            <p className="mt-0.5 text-sm text-slate-400">{user.email}</p>
          </div>
        </div>
      </div>

      <AvatarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectAvatar={handleSelectAvatar}
        isSaving={isSaving}
        saveError={saveError}
      />
    </div>
  );
}

export default ProfileHeader;
