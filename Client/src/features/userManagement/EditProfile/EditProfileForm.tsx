import AppButton from "../../../common/AppButton/AppButton";
import FormField from "../../../common/FormField/FormField";
import { useEditProfile } from "./useEditProfile";
import type { EditProfileFormProps } from "./EditProfile.types";

const ALL_GOALS = ["strength", "cardio", "flex", "consistency", "weightLoss"] as const;
const GOAL_LABELS: Record<string, string> = {
  strength: "Strength",
  cardio: "Cardio",
  flex: "Flexibility",
  consistency: "Consistency",
  weightLoss: "Weight loss",
};

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15";

export function EditProfileForm({ initialValues, onSaved, onCancel }: EditProfileFormProps) {
  const { form, isLoading, error, success, handleInputChange, toggleGoal, handleSubmit } =
    useEditProfile(initialValues, onSaved);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-extrabold text-slate-900">Edit profile</h2>
      <p className="mt-1 text-sm text-slate-500">Update your name and fitness goals.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="firstName" label="First name">
            <input
              id="firstName"
              type="text"
              value={form.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              className={inputClass}
            />
          </FormField>

          <FormField id="lastName" label="Last name">
            <input
              id="lastName"
              type="text"
              value={form.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              className={inputClass}
            />
          </FormField>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold text-slate-700">Fitness goals</p>
          <div className="flex flex-wrap gap-2">
            {ALL_GOALS.map((goal) => {
              const active = form.goals.includes(goal);
              return (
                <button
                  key={goal}
                  type="button"
                  onClick={() => toggleGoal(goal)}
                  className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                    active
                      ? "border-purple-500 bg-purple-50 text-purple-700 ring-2 ring-purple-500/20"
                      : "border-slate-200 bg-white text-slate-600 hover:border-purple-300"
                  }`}
                >
                  {GOAL_LABELS[goal]}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p>
        )}
        {success && (
          <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            ✓ Profile updated successfully.
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <AppButton type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? "Saving…" : "Save changes"}
          </AppButton>
          <AppButton type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </AppButton>
        </div>
      </form>
    </div>
  );
}

export default EditProfileForm;
