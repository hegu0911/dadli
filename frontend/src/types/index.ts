export interface User {
  id: string;
  username: string;
  email?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  cuisineTags?: string[];
  isPrivate?: boolean;
  isFollowing?: boolean;
  followRequestStatus?: string | null;
  createdAt?: string;
  _count?: {
    recipes: number;
    followers: number;
    following: number;
  };
}

export interface RecipeImage {
  id: string;
  url: string;
}

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  alternative?: string;
}

export interface Step {
  order: number;
  instruction: string;
  timer?: number;
}

export interface RecipeStats {
  likes: number;
  saves: number;
  comments: number;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  images?: RecipeImage[];
  prepTime?: number;
  cookTime?: number;
  totalTime?: number;
  difficulty?: string;
  servings?: number;
  ingredients: Ingredient[];
  steps: Step[];
  category?: string;
  cuisine?: string;
  diet?: string;
  location?: string;
  hashtags: string[];
  createdAt: string;
  author: User;
  _count: RecipeStats;
  isLiked?: boolean;
  isSaved?: boolean;
  matchedIngredients?: string[];
  matchPercentage?: number;
}

export interface Comment {
  id: string;
  text: string;
  userId: string;
  recipeId: string;
  parentId?: string;
  createdAt: string;
  user: User;
  replies?: Comment[];
}

export interface Message {
  id: string;
  content: string;
  recipeId?: string;
  senderId: string;
  receiverId: string;
  readAt?: string;
  createdAt: string;
  sender: User;
}

export interface Conversation {
  user: User;
  lastMessage: Message;
  unread: number;
}

export interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "follow_request" | "follow_accepted" | "message";
  userId: string;
  actorId: string;
  recipeId?: string;
  commentId?: string;
  read: boolean;
  createdAt: string;
  actor: User;
  recipe?: { id: string; title: string; imageUrl?: string };
}

export interface Story {
  id: string;
  imageUrl: string;
  caption?: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  user: User;
}

export interface StoryGroup {
  user: User;
  stories: {
    id: string;
    imageUrl: string;
    caption?: string;
    createdAt: string;
  }[];
}
