import AppButton from "../../../common/AppButton/AppButton";
import { useCoachConnection } from "./useCoachConnection";

export function CoachConnection() {
  const {
    connection,
    isLoading,
    isSubmitting,
    coachCodeInput,
    setCoachCodeInput,
    error,
    success,
    connect,
    disconnect,
    copyCode,
  } = useCoachConnection();

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading connection…</p>;
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          ✓ {success}
        </p>
      )}

      {/* Coach view — show their connection code */}
      {connection?.role === "coach" && (
        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-purple-500">
            Your connection code
          </p>
          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl font-extrabold tracking-widest text-purple-800">
              {connection.coachCode ?? "—"}
            </span>
            <button
              type="button"
              onClick={copyCode}
              className="rounded-xl border border-purple-300 bg-white px-3 py-1.5 text-sm font-semibold text-purple-700 hover:bg-purple-100 transition-colors"
            >
              Copy
            </button>
          </div>
          <p className="mt-2 text-xs text-purple-600">
            Share this code with trainees so they can connect to you.
          </p>
        </div>
      )}

      {/* Trainee view */}
      {connection?.role === "trainee" && (
        <>
          {connection.coach ? (
            /* Connected state */
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-emerald-600">
                Connected coach
              </p>
              <p className="text-lg font-extrabold text-slate-900">
                {connection.coach.firstName} {connection.coach.lastName}
              </p>
              <p className="text-sm text-slate-500">{connection.coach.email}</p>
              <AppButton
                type="button"
                variant="secondary"
                onClick={disconnect}
                disabled={isSubmitting}
                className="mt-4"
              >
                {isSubmitting ? "Disconnecting…" : "Disconnect"}
              </AppButton>
            </div>
          ) : (
            /* No connection — show connect form */
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
              <p className="text-sm text-slate-600">
                Enter your coach's connection code to link your accounts.
              </p>
              <input
                type="text"
                value={coachCodeInput}
                onChange={(e) => setCoachCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. A3F2B891"
                maxLength={8}
                className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 font-mono text-lg font-bold uppercase tracking-widest text-slate-950 outline-none placeholder:text-slate-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15"
              />
              <AppButton
                type="button"
                variant="primary"
                onClick={connect}
                disabled={isSubmitting || coachCodeInput.trim().length < 4}
                className="w-full"
              >
                {isSubmitting ? "Connecting…" : "Connect to coach"}
              </AppButton>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CoachConnection;
