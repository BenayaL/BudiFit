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
    avatar: "/users/me/avatar",
  },

  traineeProfiles: {
    me: "/trainee-profiles/me",
    onboarding: "/trainee-profiles/me/onboarding",
  },

  coachConnections: {
    me: "/coach-connections/me",
    connect: "/coach-connections/connect",
  },

  generatedWorkoutPlans: {
    list: "/generated-workout-plans",
    history: (localDate: string) => `/generated-workout-plans?status=history&localDate=${localDate}`,
    generate: "/generated-workout-plans/generate",
    details: (planId: string) => `/generated-workout-plans/${planId}`,
    complete: (planId: string) => `/generated-workout-plans/${planId}/complete`,
    remove: (planId: string) => `/generated-workout-plans/${planId}`,
    permanentDelete: (planId: string) => `/generated-workout-plans/${planId}/permanent`,
    replace: (planId: string) => `/generated-workout-plans/${planId}/replace`,
    requestChange: (planId: string) => `/generated-workout-plans/${planId}/request-change`,
    exerciseAlternatives: (planId: string) => `/generated-workout-plans/${planId}/exercise-alternatives`,
  },

  coach: {
    dashboard: "/coach/dashboard",
    trainees: "/coach/trainees",
    traineeDetails: (traineeId: string) => `/coach/trainees/${traineeId}`,
    plans: "/coach/plans",
    planDetails: (planId: string) => `/coach/plans/${planId}`,
    updatePlan: (planId: string) => `/coach/plans/${planId}`,
    approvePlan: (planId: string) => `/coach/plans/${planId}/approve`,
    deletePlan: (planId: string) => `/coach/plans/${planId}`,
    generatePlanForTrainee: (traineeId: string) => `/coach/trainees/${traineeId}/plans/generate`,
    traineeChangeRequests: (traineeId: string) => `/coach/trainees/${traineeId}/change-requests`,
    changeRequests: (status = "pending") => `/coach/change-requests?status=${status}`,
    rejectChangeRequest: (requestId: string) => `/coach/change-requests/${requestId}/reject`,
    resolveChangeRequest: (requestId: string) => `/coach/change-requests/${requestId}/resolve`,
  },

  notifications: {
    list: "/notifications",
    unreadCount: "/notifications/unread-count",
    markRead: (id: string) => `/notifications/${id}/read`,
    markAllRead: "/notifications/read-all",
    deleteOne: (id: string) => `/notifications/${id}`,
    deleteRead: "/notifications/read",
  },

  dailyWorkouts: {
    dashboard: "/daily-workouts/dashboard",
    complete: "/daily-workouts/complete",
    calendar: "/daily-workouts/calendar",
    history: (localDate: string) => `/daily-workouts/history?localDate=${localDate}`,
  },

  exercisePreferences: {
    list: "/exercise-preferences",
    update: "/exercise-preferences",
  },

  progress: {
    dashboard: "/progress/dashboard",
    history: "/progress/history",
  },

  bot: {
    chat: "/bot/chat",
    history: (sessionId: string) => `/bot/history/${encodeURIComponent(sessionId)}`,
  },

  export: {
    pdf: "/export/workout-summary/pdf",
    email: "/export/workout-summary/email",
    workoutPlanPdf: (planId: string) => `/export/workout-plan/${planId}/pdf`,
    workoutPlanEmail: (planId: string) => `/export/workout-plan/${planId}/email`,
    workoutHistoryPdf: "/export/workout-history/pdf",
    workoutHistoryEmail: "/export/workout-history/email",
    dailyWorkoutPdf: (planId: string, date: string) => `/export/daily-workout/${planId}/pdf?date=${date}`,
    dailyWorkoutEmail: (planId: string, date: string) => `/export/daily-workout/${planId}/email?date=${date}`,
  },
};
