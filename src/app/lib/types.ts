export type BoardCategory = "NOTICE" | "FREE" | "QNA" | "ETC";

export interface BoardSummary {
  id: number;
  title: string;
  category?: BoardCategory;
  createdAt: string;
  boardCategory?: BoardCategory;
}

export interface BoardDetail extends BoardSummary {
  content: string;
  imageUrl?: string | null;
}

export interface BoardsResponse {
  content: BoardSummary[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export interface AuthUser {
  username: string;
  name: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends Partial<AuthTokens> {
  username?: string;
  name?: string;
  user?: AuthUser;
  [key: string]: unknown;
}

export interface SignUpPayload {
  username: string;
  name: string;
  password: string;
  confirmPassword: string;
}

export interface SignInPayload {
  username: string;
  password: string;
}

export interface BoardFormPayload {
  title: string;
  content: string;
  category: BoardCategory;
  file?: File | null;
}

export type CategoryDictionary = Record<BoardCategory, string>;
