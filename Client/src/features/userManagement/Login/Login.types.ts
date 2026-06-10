export type LoginFormValues = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export interface LoginPageProps {
  onLoginSuccess: (role: "trainee" | "coach", hasCompletedOnboarding: boolean) => void;
  onGoToRegister: () => void;
  onBackToWelcome: () => void;
}
