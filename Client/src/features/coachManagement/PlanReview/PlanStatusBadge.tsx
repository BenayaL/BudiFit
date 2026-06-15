import type { CoachPlanApprovalStatus } from "../coach.models";

interface PlanStatusBadgeProps {
  approvalStatus: CoachPlanApprovalStatus;
}

export function PlanStatusBadge({ approvalStatus }: PlanStatusBadgeProps) {
  if (approvalStatus === "pending_review") {
    return (
      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
        Pending review
      </span>
    );
  }
  if (approvalStatus === "approved") {
    return (
      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
        Approved
      </span>
    );
  }
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
      No review required
    </span>
  );
}

export default PlanStatusBadge;
