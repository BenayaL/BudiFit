export type RegisterFormValues = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "trainee" | "coach";
};

export interface RegisterPageProps {
  onRegisterSuccess: (role: "trainee" | "coach") => void;
  onGoToLogin: () => void;
  onBackToWelcome: () => void;
}
