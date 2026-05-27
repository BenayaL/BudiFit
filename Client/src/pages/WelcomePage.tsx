// Import reusable brand components.
import BudiCharacter from "../components/Logo/BudiCharacter";
import BudiLogo from "../components/Logo/BudiLogo";
import AppButton from "../components/ui/AppButton";

/**
 * Props type for WelcomePage.
 *
 * The page does not decide by itself what happens after clicking buttons.
 * Instead, it receives functions from App.tsx.
 *
 * This keeps the component reusable and separated from navigation logic.
 */
interface WelcomePageProps {
  onRegister: () => void;
  onLogin: () => void;
}

/**
 * WelcomePage component
 *
 * This is the first screen the user sees.
 * It introduces Budi, explains the app idea, and gives the user two actions:
 * 1. Start registration
 * 2. Go to login
 */
 function WelcomePage({ onRegister, onLogin }: WelcomePageProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbfaf7] text-slate-950">
      {/*
        Background gradient layer.
        This creates the soft purple glow effect behind the content.
      */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(124,58,237,0.18),transparent_35%),radial-gradient(circle_at_100%_0%,rgba(192,132,252,0.16),transparent_30%),radial-gradient(circle_at_0%_100%,rgba(167,139,250,0.12),transparent_35%)]" />

      {/*
        Dotted background pattern.
        It gives the page a more polished app-like feeling.
      */}
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(124,58,237,0.25)_1px,transparent_1px)] [background-size:32px_32px]" />

      {/*
        Main page content.
        z-10 makes sure the content appears above the background layers.
      */}
      <section className="relative z-10 flex min-h-screen flex-col px-8 py-8">
        {/* Top navigation/header */}
        <header className="flex items-center justify-between">
          <BudiLogo />

          <div className="flex items-center gap-10 text-sm">
            {/*
              Small social proof text.
              Hidden on very small screens to avoid layout problems.
            */}
            <div className="hidden items-center gap-2 text-slate-500 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>
                <span className="tabular-nums">120,847</span> moving right now
              </span>
            </div>

            {/* Login button in the top-right corner */}
            <AppButton onClick={onLogin} variant="ghost">
              Log in →
            </AppButton>
          </div>
        </header>

        {/*
          Center content.
          flex-1 takes the available vertical space between header and footer.
        */}
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <BudiCharacter size="lg" />

          {/* Main text section */}
          <div className="mt-8 max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Hey 👋 I'm Budi, your coach.
            </h1>

            <div className="mt-4 space-y-2 text-xl font-medium text-slate-700 sm:text-2xl">
              <p>I build one challenge a day, just for you.</p>
              <p>I tune it to your level and your goals.</p>

              <p className="font-semibold text-purple-600">
                And I answer the moment you need me. Ready?
              </p>
            </div>
          </div>

          {/*
            Action buttons.
            On mobile they appear one under another.
            On larger screens they appear in a row.
          */}
          <div className="mt-24 flex flex-col gap-4 sm:flex-row">
            <AppButton onClick={onRegister} variant="primary">
              Yeah Budi, let's go →
            </AppButton>

            <AppButton onClick={onLogin} variant="secondary">
              Already friends
            </AppButton>
          </div>
        </div>

        {/* Bottom footer text */}
        <footer className="pb-2 text-center text-sm text-slate-400">
          Braude College Of Engineering © 2026
         <span className="text-orange-400">⚡</span> Coached by
          AI · Inspired by Gilad Budman.
        </footer>
      </section>
    </main>
  );
}

export default WelcomePage;