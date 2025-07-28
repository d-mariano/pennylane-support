import type { components } from "./schema";

export type Challenge = components["schemas"]["ChallengePublic"];
export type ChallengeCreate = components["schemas"]["ChallengeCreate"];
export type ChallengeList = components["schemas"]["ListResponse_ChallengePublic_"];
export type ChallengeUpdate = components["schemas"]["ChallengeUpdate"];

export type Conversation = components["schemas"]["ConversationPublic"];
export type ConversationCreate = components["schemas"]["ConversationCreate"];
export type ConversationList = components["schemas"]["ListResponse_ConversationPublic_"];
export type ConversationUpdate = components["schemas"]["ConversationUpdate"];


export type Post = components["schemas"]["PostPublic"];
export type PostCreate = components["schemas"]["PostCreate"];
export type PostList = components["schemas"]["ListResponse_PostPublic_"];

export type User = components["schemas"]["User"];
