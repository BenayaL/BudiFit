// features/coach — services = functions that talk to the coach backend.
// For now these are stubs; later they call the real API.

import type { Trainee, CoachPlan } from "../interfaces/coach.interfaces";

export function getTrainees(/* coachId: string */): Trainee[] {
  // Later: fetch from backend. For now the page reads fakeData directly.
  return [];
}

export function approvePlan(planId: string): void {
  console.log("approve plan", planId);
}

export function sendFeedback(traineeId: string, message: string): void {
  console.log("feedback", traineeId, message);
}