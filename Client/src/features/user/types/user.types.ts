// features/user — types = TypeScript structures that belong to the user feature
// These types describe the shape of user data used in the ProfilePage and userService.

// Goal represents the fitness objectives a user can select.
export type Goal =
  | "strength"
  | "cardio"
  | "flex"
  | "consistency"
  | "weightLoss";
