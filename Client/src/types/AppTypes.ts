/**
 * Page represents the possible screens/pages of the application.
 *
 * Using a TypeScript union type prevents mistakes.
 * For example, TypeScript will not allow values like "welcom" or "loginn".
 */
export type Page = 
                    | "welcome" 
                    | "login" 
                    | "register" 
                    | "home" 
                    | "chat" 
                    | "workout" 
                    | "dashboard" 
                    | "profile" 
                    | "social" 
                    | "notifications" 
                    | "export";