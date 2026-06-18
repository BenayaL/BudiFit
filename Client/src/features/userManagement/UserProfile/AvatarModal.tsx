import { ModalPortal } from "../../../common/ModalPortal";

export const FITNESS_AVATARS = [
  "🏋️‍♂️", "🏃‍♂️", "🚴‍♂️", "🧘‍♂️",
  "🥊", "🏊‍♂️", "🤸‍♂️", "🧗‍♂️",
  "🔥", "💪", "🏆", "👟",
];

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAvatar: (avatar: string) => Promise<void>;
  isSaving?: boolean;
  saveError?: string;
}

function AvatarModal({ isOpen, onClose, onSelectAvatar, isSaving, saveError }: AvatarModalProps) {
  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-5 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100">
              <span className="text-xl">🎭</span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">Choose your avatar</h3>
            <p className="mt-1 text-sm text-slate-500">
              Pick an avatar that fits your training vibe
            </p>
          </div>

          {saveError && (
            <p className="mb-4 rounded-2xl bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-600">
              {saveError}
            </p>
          )}

          <div className="mb-6 grid grid-cols-4 gap-3">
            {FITNESS_AVATARS.map((avatar) => (
              <button
                key={avatar}
                type="button"
                disabled={isSaving}
                onClick={() => void onSelectAvatar(avatar)}
                className="flex h-14 w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-2xl transition hover:border-purple-300 hover:bg-purple-50 hover:ring-2 hover:ring-purple-500/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {avatar}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {isSaving ? "Saving…" : "Close"}
          </button>
        </div>
      </div>
    </ModalPortal>
  );
}

export default AvatarModal;
