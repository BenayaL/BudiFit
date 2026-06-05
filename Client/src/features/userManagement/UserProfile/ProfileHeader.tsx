import AppButton from "../../../common/AppButton/AppButton";
import type { UserProfile } from "../user.models";

interface ProfileHeaderProps {
  user: UserProfile;
  onEditProfile: () => void;
}

export function ProfileHeader({ user, onEditProfile }: ProfileHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-[24px] bg-slate-900 shadow-lg">
      <div className="h-32 w-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-orange-400 opacity-90" />

      <div className="px-8 pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-12 relative z-10">
        <div className="flex flex-col sm:flex-row gap-6 sm:items-end">
          <div className="w-24 h-24 rounded-full bg-purple-600 border-4 border-slate-900 flex items-center justify-center text-4xl font-extrabold text-white shadow-md">
            {user.firstName.charAt(0).toUpperCase()}
          </div>

          <div className="mb-1 text-white translate-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-xs font-medium backdrop-blur-sm mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active now
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {user.level} · Joined {user.memberSince}
            </p>
          </div>
        </div>

        <AppButton
          variant="secondary"
          onClick={onEditProfile}
          className="bg-white/10 border-none text-white hover:bg-white/20 translate-y-4"
        >
          Edit Profile
        </AppButton>
      </div>
    </div>
  );
}

export default ProfileHeader;
