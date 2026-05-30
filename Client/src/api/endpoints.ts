// api = shared HTTP communication layer used by all feature services
// endpoints centralises every API path so there are no magic strings in service files.

export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
  },
  users: {
    profile: (userId: string) => `/users/${userId}/profile`,
  },
  challenges: {
    today: "/challenges/today",
    complete: (challengeId: string) => `/challenges/${challengeId}/complete`,
  },
  bot: {
    chat: "/bot/chat",
    history: (sessionId: string) => `/bot/chat/${sessionId}/history`,
  },
  progress: {
    summary: (userId: string) => `/progress/${userId}/summary`,
    history: (userId: string) => `/progress/${userId}/history`,
  },
};
