import { BudiCharacter } from "../../../../common/BudiLogo/BudiCharacter";

export function WelcomeStep() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-8 text-center">
      <BudiCharacter size="md" />

      <div className="max-w-lg">
        <div className="mb-4 inline-block rounded-full bg-purple-100 px-4 py-1.5 text-sm font-semibold text-purple-700">
          Welcome to BudiFit
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
          Your personalized{" "}
          <span className="text-purple-600">fitness journey</span>{" "}
          starts here.
        </h1>

        <p className="mt-4 text-lg text-slate-600">
          Answer a few quick questions so Budi can build workouts tailored exactly to you.
          It takes about 2 minutes.
        </p>
      </div>

      <div className="grid w-full max-w-sm gap-3 text-left">
        {[
          { icon: "🎯", label: "Personalized workouts for your level and goals" },
          { icon: "🏋️", label: "Plans built around your available equipment" },
          { icon: "🤖", label: "AI coach that adapts as you progress" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm font-medium text-slate-700">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
