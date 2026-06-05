import type { PlanStatus } from "../coach.models";

interface PlanStatusBadgeProps {
  status: PlanStatus;
}

export function PlanStatusBadge({ status }: PlanStatusBadgeProps) {
  const classes =
    status === "pending_approval"
      ? "bg-orange-100 text-orange-700"
      : status === "approved"
        ? "bg-emerald-100 text-emerald-700"
        : "bg-red-100 text-red-700";

  const label =
    status === "pending_approval" ? "Pending" : status === "approved" ? "Approved" : "Rejected";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${classes}`}>{label}</span>
  );
}

export default PlanStatusBadge;
