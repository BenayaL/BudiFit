import { EditPersonalDetailsForm } from "./EditPersonalDetailsForm";

interface EditPersonalDetailsPageProps {
  onBack: () => void;
}

export function EditPersonalDetailsPage({ onBack }: EditPersonalDetailsPageProps) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <button
        type="button"
        onClick={onBack}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        ← Back to profile
      </button>

      <div className="mt-6">
        <EditPersonalDetailsForm onSaved={onBack} onCancel={onBack} />
      </div>
    </main>
  );
}

export default EditPersonalDetailsPage;
