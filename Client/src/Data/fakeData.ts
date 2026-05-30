// data = temporary static data used during UI development
// Remove entries here as they are replaced by real API calls from feature services.

import type { UserProfile } from "../features/user/interfaces/user.interfaces";

// Fake logged-in user — used by App.tsx and ProfilePage until userService is wired up.
export const fakeUser: UserProfile = {
  name: "Julian",
  level: "Intermediate",
  memberSince: "April 2025",
  streak: 14,
  totalWorkouts: 42,
  totalMinutes: 2520,
  goals: ["consistency", "strength", "cardio", "weightLoss"],
  achievements: [
    {
      id: "1",
      title: "First Step",
      description: "Completed your first workout",
      earned: true,
      icon: "flame",
    },
    {
      id: "2",
      title: "7-Day Streak",
      description: "Showed up for a full week",
      earned: true,
      icon: "flame",
    },
    {
      id: "3",
      title: "Early Bird",
      description: "Workout before 7 AM",
      earned: true,
      icon: "clock",
    },
  ],
};
