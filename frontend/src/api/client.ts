import { Challenge, Conversation, ChallengeList, ConversationList, Post, PostList, User, PostCreate } from "./openapi/types";

const API_BASE_URL = 'http://localhost:8000';

export const apiClient = {
  // Challenges
  getChallenges: async (params: {
    offset?: number;
    limit?: number;
    difficulty?: string;
    category?: string;
  } = {}): Promise<ChallengeList> => {
    const query = new URLSearchParams();
    if (params.offset !== undefined) query.append('offset', params.offset.toString());
    if (params.limit !== undefined) query.append('limit', params.limit.toString());
    if (params.difficulty) query.append('difficulty', params.difficulty);
    if (params.category) query.append('category', params.category);
    
    const response = await fetch(`${API_BASE_URL}/challenges?${query.toString()}`);
    return handleResponse<ChallengeList>(response);
  },
  
  getChallenge: async (id: string): Promise<Challenge> => {
    const response = await fetch(`${API_BASE_URL}/challenges/${id}`);
    return handleResponse<Challenge>(response);
  },

  // Conversations
  getConversations: async (params: {
    offset?: number;
    limit?: number;
    status?: string;
    category?: string;
    challenge_id?: string;
  } = {}): Promise<ConversationList> => {
    const query = new URLSearchParams();
    if (params.offset !== undefined) query.append('offset', params.offset.toString());
    if (params.limit !== undefined) query.append('limit', params.limit.toString());
    if (params.status) query.append('status', params.status);
    if (params.category) query.append('category', params.category);
    if (params.challenge_id) query.append('challenge_id', params.challenge_id);
    
    const response = await fetch(`${API_BASE_URL}/conversations?${query.toString()}`);
    return handleResponse<ConversationList>(response);
  },

  getUserConversations: async (params: {
    offset?: number;
    limit?: number;
  } = {}): Promise<ConversationList> => {
    const query = new URLSearchParams();
    if (params.offset !== undefined) query.append('offset', params.offset.toString());
    if (params.limit !== undefined) query.append('limit', params.limit.toString());
    
    const response = await fetch(`${API_BASE_URL}/conversations/user?${query.toString()}`);
    return handleResponse<ConversationList>(response);
  },

  getConversation: async (id: string): Promise<Conversation> => {
    const response = await fetch(`${API_BASE_URL}/conversations/${id}`);
    return handleResponse<Conversation>(response);
  },

  createConversation: async (data: {
    topic: string;
    category: string;
    challenge_id?: string;
    initial_post?: {
      user: string;
      content: string;
    };
  }): Promise<Conversation> => {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Conversation>(response);
  },

  // Posts
  getPosts: async (conversationId: string, params: {
    offset?: number;
    limit?: number;
  } = {}): Promise<PostList> => {
    const query = new URLSearchParams();
    if (params.offset !== undefined) query.append('offset', params.offset.toString());
    if (params.limit !== undefined) query.append('limit', params.limit.toString());
    
    const response = await fetch(
      `${API_BASE_URL}/conversations/${conversationId}/posts?${query.toString()}`
    );
    return handleResponse<PostList>(response);
  },

  createPost: async (conversationId: string, data: PostCreate): Promise<Post> => {
    const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Post>(response);
  },

  getUser: async (): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/user`);
    return handleResponse<User>(response);
  },
};

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      data.detail || data.message || 'Something went wrong. Please try again.'
    );
  }
  return data as T;
}
