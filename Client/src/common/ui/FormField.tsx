// shared = reusable components used by several features
// FormField wraps any input with a label and optional error message.
// Used in LoginPage, RegisterPage, and any future form screens.

import type { ReactNode } from "react";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}

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
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      {children}

      {error && (
        <p className="mt-2 text-sm font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}

export default FormField;
