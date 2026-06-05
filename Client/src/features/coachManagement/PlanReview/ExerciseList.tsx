import type { PlanExercise } from "../coach.models";
import { ExerciseItem } from "./ExerciseItem";

interface ExerciseListProps {
  exercises: PlanExercise[];
}

export function ExerciseList({ exercises }: ExerciseListProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-extrabold text-slate-900">Exercises</h2>
      <div className="mt-5 space-y-4">
        {exercises.map((exercise) => (
          <ExerciseItem key={exercise.id} exercise={exercise} />
        ))}
      </div>
    </div>
  );
}

export default ExerciseList;
