interface DeleteEditorItemModalProps {
  itemType: "day" | "exercise";
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteEditorItemModal({
  itemType,
  itemName,
  onConfirm,
  onCancel,
}: DeleteEditorItemModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        className="mx-4 w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-extrabold text-slate-900 capitalize">
          Delete {itemType}?
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          <span className="font-semibold text-slate-700">"{itemName}"</span>{" "}
          will be permanently removed from this plan. This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
