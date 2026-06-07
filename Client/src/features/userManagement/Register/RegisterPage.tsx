import AppButton from "../../../common/AppButton/AppButton";
import BudiLogo from "../../../common/BudiLogo/BudiLogo";
import BudiCharacter from "../../../common/BudiLogo/BudiCharacter";
import { RegisterForm } from "./RegisterForm";
import { useRegister } from "./useRegister";
import type { RegisterPageProps } from "./Register.types";

function RegisterPage({ onGoToLogin, onBackToWelcome }: RegisterPageProps) {
  const { form, error, isLoading, isFormValid, handleInputChange, handleSubmit } =
    useRegister(onGoToLogin);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbfaf7] text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.18),transparent_35%),radial-gradient(circle_at_90%_10%,rgba(192,132,252,0.14),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(167,139,250,0.12),transparent_35%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(124,58,237,0.25)_1px,transparent_1px)] [background-size:32px_32px]" />

      <section className="relative z-10 flex min-h-screen flex-col px-8 py-8">
        <header className="flex items-center justify-between">
          <button type="button" onClick={onBackToWelcome}>
            <BudiLogo />
          </button>
          <AppButton variant="ghost" onClick={onBackToWelcome}>
            Back home →
          </AppButton>
        </header>

        <div className="flex flex-1 items-center justify-center py-10">
          
            <div>
              <div className="mx-auto mb-4 flex justify-center lg:hidden">
                <BudiCharacter size="sm" />
              </div>
              <RegisterForm
                form={form}
                error={error}
                isLoading={isLoading}
                isFormValid={isFormValid}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                onGoToLogin={onGoToLogin}
              />
            </div>
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;
