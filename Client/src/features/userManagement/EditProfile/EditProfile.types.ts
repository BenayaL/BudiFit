import type { Goal } from "../user.models";

export interface EditProfileFormValues {
  firstName: string;
  lastName: string;
  goals: Goal[];
}

export interface EditProfileFormProps {
  initialValues: EditProfileFormValues;
  onSaved: (updated: EditProfileFormValues) => void;
  onCancel: () => void;
}
