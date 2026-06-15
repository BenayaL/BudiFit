import type { CurrentUser } from "../user.models";

export interface UserProfilePageProps {
  onLogout?: () => void | Promise<void>;
}

export type { CurrentUser };
