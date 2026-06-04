// data = temporary static data used during UI development
// Remove entries here as they are replaced by real API calls from feature services.

import type { UserProfile } from "../features/user/interfaces/user.interfaces";
import type {
  Coach,
  CoachPlan,
  Trainee,
} from "../features/coach/interfaces/coach.interfaces";

// Fake logged-in trainee user — used by App.tsx and ProfilePage until userService is wired up.
export const fakeUser: UserProfile = {
  userId: "user-1",
  firstName: "Julian",
  lastName: "Cohen",
  email: "julian@budifit.com",
  level: "Intermediate",
  role: "trainee",

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

// Fake coach user — this is the coach account for the coach side.
export const fakeCoach: Coach = {
  userId: "coach-1",
  firstName: "Yaniv",
  lastName: "Ben David",
  email: "coach@budifit.com",
  level: "Professional",
  role: "coach",
  assignedTraineeIds: ["trainee-1", "trainee-2", "trainee-3"],
};

// Fake trainees assigned to the coach.
export const fakeTrainees: Trainee[] = [
  {
    userId: "trainee-1",
    firstName: "Maya",
    lastName: "Levi",
    email: "maya@example.com",
    level: "Beginner",
    role: "trainee",
    color: "#7C3AED",
    status: "active",
    streakDays: 5,
    completedChallenges: 18,
    missedWorkouts: 1,
    weeklyActivity: [1, 1, 0, 1, 2, 1, 0],
    goals: ["weightLoss", "consistency"],
  },
  {
    userId: "trainee-2",
    firstName: "Amit",
    lastName: "Cohen",
    email: "amit@example.com",
    level: "Intermediate",
    role: "trainee",
    color: "#2563EB",
    status: "needs_attention",
    streakDays: 1,
    completedChallenges: 9,
    missedWorkouts: 3,
    weeklyActivity: [0, 0, 1, 0, 1, 0, 0],
    goals: ["strength", "cardio"],
  },
  {
    userId: "trainee-3",
    firstName: "Noa",
    lastName: "Israel",
    email: "noa@example.com",
    level: "Advanced",
    role: "trainee",
    color: "#F97316",
    status: "active",
    streakDays: 12,
    completedChallenges: 31,
    missedWorkouts: 0,
    weeklyActivity: [1, 2, 1, 1, 2, 1, 1],
    goals: ["strength", "consistency"],
  },
];

// Fake workout plans waiting for coach review.
export const fakeCoachPlans: CoachPlan[] = [
  {
    id: "plan-1",
    traineeId: "trainee-1",
    traineeName: "Maya Levi",
    title: "Beginner Full Body Week",
    status: "pending_approval",
    exercises: [
      {
        id: "ex-1",
        name: "Bodyweight Squat",
        sets: 3,
        reps: 12,
        equipment: "None",
        difficulty: "easy",
      },
      {
        id: "ex-2",
        name: "Incline Push-up",
        sets: 3,
        reps: 10,
        equipment: "Bench",
        difficulty: "easy",
      },
    ],
  },
  {
    id: "plan-2",
    traineeId: "trainee-2",
    traineeName: "Amit Cohen",
    title: "Strength Reset Plan",
    status: "pending_approval",
    exercises: [
      {
        id: "ex-3",
        name: "Goblet Squat",
        sets: 4,
        reps: 8,
        equipment: "Dumbbell",
        difficulty: "moderate",
      },
      {
        id: "ex-4",
        name: "Dumbbell Row",
        sets: 4,
        reps: 10,
        equipment: "Dumbbell",
        difficulty: "moderate",
      },
    ],
  },
  {
    id: "plan-3",
    traineeId: "trainee-3",
    traineeName: "Noa Israel",
    title: "Advanced Conditioning",
    status: "approved",
    exercises: [
      {
        id: "ex-5",
        name: "Jump Squats",
        sets: 4,
        reps: 15,
        equipment: "None",
        difficulty: "hard",
      },
    ],
  },
];