// api — central registry of every backend route the frontend calls.
// Import from here instead of writing path strings in service files.

export const ENDPOINTS = {
  auth: {
    login: "/users/login",
    register: "/users/register",
    logout: "/users/logout",
    currentUser: "/users/me",
  },

  users: {
    updateMe: "/users/me",
    settings: "/users/me/settings",
  },

  traineeProfiles: {
    onboarding: "/trainee-profiles/me/onboarding",
  },

  coachConnections: {
    me: "/coach-connections/me",
    connect: "/coach-connections/connect",
  },

  workouts: {
    list: "/workouts",
    details: (workoutId: string) => `/workouts/${workoutId}`,
    complete: (workoutId: string) => `/workouts/${workoutId}/complete`,
  },

  challenges: {
    today: "/challenges/today",
    weekly: "/challenges/weekly",
    history: "/challenges/history",
    complete: (challengeId: string) => `/challenges/${challengeId}/complete`,
  },

  coach: {
    dashboard: "/coach/dashboard",
    trainees: "/coach/trainees",
    traineeDetails: (traineeId: string) => `/coach/trainees/${traineeId}`,
    plans: "/coach/plans",
    planDetails: (planId: string) => `/coach/plans/${planId}`,
    approvePlan: (planId: string) => `/coach/plans/${planId}/approve`,
    rejectPlan: (planId: string) => `/coach/plans/${planId}/reject`,
  },

  progress: {
    dashboard: "/progress/dashboard",
    history: "/progress/history",
  },

  bot: {
    chat: "/bot/chat",
    history: (sessionId: string) => `/bot/history/${sessionId}`,
  },

  export: {
    pdf: "/export/workout-summary/pdf",
    email: "/export/workout-summary/email",
  },
};
