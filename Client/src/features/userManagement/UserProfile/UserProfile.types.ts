import type { CurrentUser } from "../user.models";

export interface UserProfilePageProps {
  onLogout?: () => void | Promise<void>;
  onEditPersonalDetails?: () => void;
}

export type { CurrentUser };
