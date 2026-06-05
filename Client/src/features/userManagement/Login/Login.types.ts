export type LoginFormValues = {
  email: string;
  password: string;
};

export interface LoginPageProps {
  onLoginSuccess: (role: "trainee" | "coach") => void;
  onGoToRegister: () => void;
  onBackToWelcome: () => void;
}
