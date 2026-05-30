// features/bot — types = TypeScript structures that belong to the bot feature

// MessageRole distinguishes who sent a chat message.
export type MessageRole = "user" | "assistant";

// ChatStatus represents the state of the bot's response.
export type ChatStatus = "idle" | "typing" | "error";
