import type { Equipment } from "../../user.models";
import { EQUIPMENT_OPTIONS } from "../onboarding.constants";
import { SelectableTile } from "../components/SelectableTile";

interface EquipmentStepProps {
  availableEquipment: Equipment[];
  onToggle: (equipment: Equipment) => void;
  validationError: string | null;
}

export function EquipmentStep({ availableEquipment, onToggle, validationError }: EquipmentStepProps) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-2 inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
        Step 6 · Equipment
      </div>
      <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">
        What's at your gym?
      </h2>
      <p className="mt-2 mb-8 text-slate-500">
        Select everything available to you.{" "}
        <span className="font-semibold text-purple-600">
          {availableEquipment.length} selected
        </span>
        . Budi builds plans around only what you have.
      </p>

      <fieldset>
        <legend className="sr-only">Select available equipment</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {EQUIPMENT_OPTIONS.map(({ value, label, emoji }) => {
            const selected = availableEquipment.includes(value);
            return (
              <SelectableTile
                key={value}
                selected={selected}
                onClick={() => onToggle(value)}
                label={label}
                className="flex flex-col gap-2"
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-sm font-semibold leading-tight text-slate-800">{label}</span>
              </SelectableTile>
            );
          })}
        </div>
      </fieldset>

      {validationError && (
        <p className="mt-3 text-xs font-medium text-red-500" role="alert">
          {validationError}
        </p>
      )}
    </div>
  );
}
