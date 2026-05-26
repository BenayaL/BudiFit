import type { ReactNode } from "react";

/**
 * FormFieldProps defines the props for a reusable form field wrapper.
 *
 * id - connects the label to the input.
 * label - the text displayed above the input.
 * error - optional error message displayed under the field.
 * children - the actual input/select/textarea passed into the component.
 */
type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
};

/**
 * FormField component
 *
 * This component is responsible for the common structure of a form field:
 * label, spacing, content area, and optional error message.
 *
 * It does not create the input by itself.
 * This makes it flexible for email, password, username, select, textarea, etc.
 */
export function FormField({ id, label, error, children }: FormFieldProps) {
  return (
    <div>
      {/* Label connected to the input by htmlFor/id */}
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      {/* The real input/select/textarea comes from the parent component */}
      {children}

      {/* validation error */}
      {error && (
        <p className="mt-2 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}