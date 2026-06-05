interface PlanReviewActionsProps {
  onApprove: () => void;
  onRequestChanges: () => void;
  onReject: () => void;
}

export function PlanReviewActions({ onApprove, onRequestChanges, onReject }: PlanReviewActionsProps) {
  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-extrabold text-slate-900">Coach decision</h2>
      <p className="mt-2 text-sm text-slate-500">
        Approve, request changes, or reject this plan.
      </p>

      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={onApprove}
          className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
        >
          Approve plan
        </button>
        <button
          type="button"
          onClick={onRequestChanges}
          className="w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
        >
          Request changes
        </button>
        <button
          type="button"
          onClick={onReject}
          className="w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700"
        >
          Reject plan
        </button>
      </div>

      <label className="mt-6 block">
        <span className="text-sm font-bold text-slate-700">Coach notes</span>
        <textarea
          rows={5}
          placeholder="Write feedback for the trainee..."
          className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-purple-400 focus:bg-white"
        />
      </label>
    </aside>
  );
}

export default PlanReviewActions;
