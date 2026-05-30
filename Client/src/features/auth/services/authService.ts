// features/auth — services = API communication logic
// authService will handle all HTTP requests to the auth microservice.
// Replace the fake timeouts in LoginPage and RegisterPage with calls to these functions.

// import { httpClient } from "../../../api/httpClient";

export const authService = {
  /**
   * login — sends credentials to the auth backend and returns a session token.
   *
   * Usage (future):
   *   const { token } = await authService.login(email, password);
   */
  login: async (_email: string, _password: string) => {
    // TODO: return httpClient.post("/auth/login", { email, password });
    throw new Error("authService.login is not yet implemented.");
  },

  /**
   * register — creates a new user account on the auth backend.
   *
   * Usage (future):
   *   await authService.register({ fullName, username, email, password });
   */
  register: async (_data: {
    fullName: string;
    username: string;
    email: string;
    password: string;
  }) => {
    // TODO: return httpClient.post("/auth/register", data);
    throw new Error("authService.register is not yet implemented.");
  },

  /**
   * logout — invalidates the current session on the backend.
   */
  logout: async () => {
    // TODO: return httpClient.post("/auth/logout");
    throw new Error("authService.logout is not yet implemented.");
  },
};
