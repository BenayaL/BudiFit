import { useState, useEffect } from "react";
import type { Coach, Trainee, CoachPlan } from "../coach.models";
import type { CoachDashboardState } from "./CoachDashboard.types";
import { coachService } from "../coachService";
import { useAuth } from "../../../app/AuthContext";

// TODO: remove FALLBACK_* when backend is connected.
const FALLBACK_COACH: Coach = {
  userId: "coach-1",
  firstName: "Yaniv",
  lastName: "Ben David",
  email: "coach@budifit.com",
  level: "Professional",
  role: "coach",
  assignedTraineeIds: ["trainee-1", "trainee-2", "trainee-3"],
};

const FALLBACK_TRAINEES: Trainee[] = [
  { userId: "trainee-1", firstName: "Maya", lastName: "Levi", email: "maya@example.com", level: "Beginner", role: "trainee", color: "#7C3AED", status: "active", streakDays: 5, completedChallenges: 18, missedWorkouts: 1, weeklyActivity: [1,1,0,1,2,1,0], goals: ["weightLoss","consistency"] },
  { userId: "trainee-2", firstName: "Amit", lastName: "Cohen", email: "amit@example.com", level: "Intermediate", role: "trainee", color: "#2563EB", status: "needs_attention", streakDays: 1, completedChallenges: 9, missedWorkouts: 3, weeklyActivity: [0,0,1,0,1,0,0], goals: ["strength","cardio"] },
  { userId: "trainee-3", firstName: "Noa", lastName: "Israel", email: "noa@example.com", level: "Advanced", role: "trainee", color: "#F97316", status: "active", streakDays: 12, completedChallenges: 31, missedWorkouts: 0, weeklyActivity: [1,2,1,1,2,1,1], goals: ["strength","consistency"] },
];

const FALLBACK_PLANS: CoachPlan[] = [
  { id: "plan-1", traineeId: "trainee-1", traineeName: "Maya Levi", title: "Beginner Full Body Week", status: "pending_approval", exercises: [{ id: "ex-1", name: "Bodyweight Squat", sets: 3, reps: 12, equipment: "None", difficulty: "easy" }, { id: "ex-2", name: "Incline Push-up", sets: 3, reps: 10, equipment: "Bench", difficulty: "easy" }] },
  { id: "plan-2", traineeId: "trainee-2", traineeName: "Amit Cohen", title: "Strength Reset Plan", status: "pending_approval", exercises: [{ id: "ex-3", name: "Goblet Squat", sets: 4, reps: 8, equipment: "Dumbbell", difficulty: "moderate" }, { id: "ex-4", name: "Dumbbell Row", sets: 4, reps: 10, equipment: "Dumbbell", difficulty: "moderate" }] },
  { id: "plan-3", traineeId: "trainee-3", traineeName: "Noa Israel", title: "Advanced Conditioning", status: "approved", exercises: [{ id: "ex-5", name: "Jump Squats", sets: 4, reps: 15, equipment: "None", difficulty: "hard" }] },
];

export function useCoachDashboard(): CoachDashboardState {
  const { token } = useAuth();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [pendingPlans, setPendingPlans] = useState<CoachPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const error = "";

  useEffect(() => {
    if (!token) {
      setCoach(FALLBACK_COACH);
      setTrainees(FALLBACK_TRAINEES);
      setPendingPlans(FALLBACK_PLANS.filter((p) => p.status === "pending_approval"));
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await coachService.getCoachDashboard(token);
        setCoach(data.coach);
        setTrainees(data.trainees);
        setPendingPlans(data.pendingPlans);
      } catch {
        // TODO: remove fallback when backend is connected
        console.warn("[DEV] getCoachDashboard failed — using fallback.");
        setCoach(FALLBACK_COACH);
        setTrainees(FALLBACK_TRAINEES);
        setPendingPlans(FALLBACK_PLANS.filter((p) => p.status === "pending_approval"));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token]);

  return { coach, trainees, pendingPlans, isLoading, error };
}

export { FALLBACK_TRAINEES as COACH_FALLBACK_TRAINEES, FALLBACK_PLANS as COACH_FALLBACK_PLANS };
