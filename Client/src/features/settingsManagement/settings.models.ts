// settingsManagement — data contracts for settings and coach-connection APIs.

import type { UserSettings, ConnectedCoach } from "../userManagement/user.models";

export type { UserSettings };

export interface CoachConnectionState {
  role: "trainee" | "coach";
  coach?: ConnectedCoach | null;
  coachCode?: string;
}
