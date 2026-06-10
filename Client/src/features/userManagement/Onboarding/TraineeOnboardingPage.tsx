import { useState } from "react";
import type { FormEvent } from "react";
import { AppButton } from "../../../common/AppButton/AppButton";
import { BudiLogo } from "../../../common/BudiLogo/BudiLogo";
import { BudiCharacter } from "../../../common/BudiLogo/BudiCharacter";
import { userService } from "../userService";
import { useAuth } from "../../../app/AuthContext";

interface TraineeOnboardingPageProps {
  onComplete: () => void;
}

type FitnessLevel = "beginner" | "intermediate" | "advanced";

const FITNESS_LEVELS: { value: FitnessLevel; label: string; description: string }[] = [
  { value: "beginner",     label: "Beginner",     description: "New to working out or returning after a long break." },
  { value: "intermediate", label: "Intermediate", description: "Training consistently for 6+ months."               },
  { value: "advanced",     label: "Advanced",     description: "Years of structured training and solid technique."  },
];

const WORKOUTS_PER_WEEK = [1, 2, 3, 4, 5, 6, 7];

function TraineeOnboardingPage({ onComplete }: TraineeOnboardingPageProps) {
  const { token, updateCurrentUser } = useAuth();

  const [fitnessLevel, setFitnessLevel]       = useState<FitnessLevel | "">("");
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState<number | "">("");
  const [height, setHeight]                   = useState("");
  const [weight, setWeight]                   = useState("");
  const [age, setAge]                         = useState("");
  const [medical, setMedical]                 = useState("");
  const [errors, setErrors]                   = useState<Record<string, string>>({});
  const [isLoading, setIsLoading]             = useState(false);
  const [serverError, setServerError]         = useState("");

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!fitnessLevel)    next.fitnessLevel    = "Please select your fitness level.";
    if (!workoutsPerWeek) next.workoutsPerWeek = "Please select workouts per week.";
    const h = Number(height);
    if (!height || isNaN(h) || h < 100 || h > 250)
      next.height = "Enter a height between 100 and 250 cm.";
    const w = Number(weight);
    if (!weight || isNaN(w) || w < 30 || w > 300)
      next.weight = "Enter a weight between 30 and 300 kg.";
    const a = Number(age);
    if (!age || isNaN(a) || a < 10 || a > 100)
      next.age = "Enter an age between 10 and 100.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (!token) { setServerError("Not authenticated."); return; }

    setIsLoading(true);
    setServerError("");

    try {
      const result = await userService.submitOnboarding(
        {
          fitnessLevel: fitnessLevel as FitnessLevel,
          goals: [],
          weeklyWorkouts: Number(workoutsPerWeek),
          height: Number(height),
          weight: Number(weight),
          age: Number(age),
          medicalConditions: medical.trim() ? [medical.trim()] : [],
        },
        token
      );

      updateCurrentUser(result.user);
      onComplete();
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Failed to save your profile. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const isFormValid = !!fitnessLevel && !!workoutsPerWeek && !!height && !!weight && !!age;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbfaf7] text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.18),transparent_35%),radial-gradient(circle_at_90%_10%,rgba(192,132,252,0.14),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(167,139,250,0.12),transparent_35%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(124,58,237,0.25)_1px,transparent_1px)] [background-size:32px_32px]" />

      <section className="relative z-10 flex min-h-screen flex-col px-8 py-8">
        <header className="flex items-center justify-between">
          <BudiLogo />
          <p className="text-sm font-medium text-slate-500">Step 1 of 1 — Your fitness profile</p>
        </header>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="grid w-full max-w-5xl items-start gap-12 lg:grid-cols-2">

            <div className="hidden flex-col items-center text-center lg:flex">
              <BudiCharacter size="md" />
              <h1 className="mt-8 text-4xl font-extrabold tracking-tight">
                Let's set up your profile.
              </h1>
              <p className="mt-4 max-w-md text-lg font-medium text-slate-600">
                Tell me a little about yourself so I can build the right challenges for you.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
              <div className="mb-6 flex justify-center lg:hidden">
                <BudiCharacter size="sm" />
              </div>
              <h2 className="mb-6 text-2xl font-extrabold">Your fitness profile</h2>

              <form onSubmit={handleSubmit} className="space-y-6">

                <fieldset>
                  <legend className="mb-2 text-sm font-semibold text-slate-700">
                    Fitness level <span className="text-purple-600">*</span>
                  </legend>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {FITNESS_LEVELS.map(({ value, label, description }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFitnessLevel(value)}
                        className={`rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-purple-500/40 ${
                          fitnessLevel === value
                            ? "border-purple-600 bg-purple-50 ring-2 ring-purple-500/30"
                            : "border-slate-200 hover:border-purple-300"
                        }`}
                      >
                        <span className="block font-semibold">{label}</span>
                        <span className="mt-1 block text-xs text-slate-500">{description}</span>
                      </button>
                    ))}
                  </div>
                  {errors.fitnessLevel && (
                    <p className="mt-1 text-xs text-red-500">{errors.fitnessLevel}</p>
                  )}
                </fieldset>

                <fieldset>
                  <legend className="mb-2 text-sm font-semibold text-slate-700">
                    Planned workouts per week <span className="text-purple-600">*</span>
                  </legend>
                  <div className="flex gap-2 flex-wrap">
                    {WORKOUTS_PER_WEEK.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setWorkoutsPerWeek(n)}
                        className={`h-10 w-10 rounded-xl border text-sm font-semibold transition ${
                          workoutsPerWeek === n
                            ? "border-purple-600 bg-purple-600 text-white"
                            : "border-slate-200 text-slate-700 hover:border-purple-300"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  {errors.workoutsPerWeek && (
                    <p className="mt-1 text-xs text-red-500">{errors.workoutsPerWeek}</p>
                  )}
                </fieldset>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Height (cm)", key: "height", value: height, setter: setHeight, placeholder: "e.g. 175" },
                    { label: "Weight (kg)", key: "weight", value: weight, setter: setWeight, placeholder: "e.g. 70"  },
                    { label: "Age",         key: "age",    value: age,    setter: setAge,    placeholder: "e.g. 25"  },
                  ].map(({ label, key, value: val, setter, placeholder }) => (
                    <div key={key}>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">
                        {label} <span className="text-purple-600">*</span>
                      </label>
                      <input
                        type="number"
                        value={val}
                        onChange={(e) => setter(e.target.value)}
                        placeholder={placeholder}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15"
                      />
                      {errors[key] && (
                        <p className="mt-1 text-xs text-red-500">{errors[key]}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Medical conditions or physical limitations
                    <span className="ml-1 font-normal text-slate-400">(optional)</span>
                  </label>
                  <textarea
                    value={medical}
                    onChange={(e) => setMedical(e.target.value)}
                    rows={3}
                    placeholder="e.g. Lower back pain, asthma, recent knee injury…"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15 resize-none"
                  />
                </div>

                {serverError && (
                  <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {serverError}
                  </p>
                )}

                <AppButton
                  type="submit"
                  variant="primary"
                  disabled={!isFormValid || isLoading}
                  className="w-full"
                >
                  {isLoading ? "Saving…" : "Start training with Budi →"}
                </AppButton>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default TraineeOnboardingPage;
