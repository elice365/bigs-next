"use client";

import { API_BASE_URL } from "./constants";
import { useAuthStore } from "./stores/auth-store";
import type {
  AuthResponse,
  AuthTokens,
  BoardDetail,
  BoardFormPayload,
  BoardsResponse,
  CategoryDictionary,
  SignInPayload,
  SignUpPayload,
} from "./types";

class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

const defaultHeaders: HeadersInit = {
  "Content-Type": "application/json",
};

const extractErrorMessage = (payload: unknown) => {
  if (!payload) return "요청에 실패했습니다.";
  if (typeof payload === "string") {
    try {
      const parsed = JSON.parse(payload);
      return extractErrorMessage(parsed);
    } catch {
      return payload.trim().length > 0 ? payload : "요청에 실패했습니다.";
    }
  }
  if (typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.message === "string") return record.message;
    if (typeof record.error === "string") return record.error;
    if (Array.isArray(record.errors) && record.errors.length > 0) {
      const [first] = record.errors;
      if (typeof first === "string") return first;
      if (first && typeof first === "object") {
        const nested = first as Record<string, unknown>;
        for (const value of Object.values(nested)) {
          if (typeof value === "string") return value;
        }
      }
    }
  }
  return "요청에 실패했습니다.";
};

const jsonFetch = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const isFormData = options.body instanceof FormData;
  const headers = options.headers ?? (isFormData ? undefined : defaultHeaders);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");
  const payload = contentType?.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new ApiError(extractErrorMessage(payload), response.status, payload);
  }

  return payload as T;
};

const parseAuthResponse = (
  payload: AuthResponse,
): AuthTokens & {
  user: { username: string; name: string };
} => {
  const extractedUser = payload.user ?? {
    username: payload.username ?? "",
    name: payload.name ?? "",
  };

  if (!payload.accessToken || !payload.refreshToken) {
    throw new Error("Missing tokens in authentication response");
  }

  return {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    user: extractedUser,
  };
};

export const authApi = {
  signup: (data: SignUpPayload) =>
    jsonFetch<void>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  signin: async (data: SignInPayload) => {
    const payload = await jsonFetch<AuthResponse>("/auth/signin", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return parseAuthResponse(payload);
  },
  refresh: async (refreshToken: string) => {
    const payload = await jsonFetch<AuthResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
    const result = parseAuthResponse(payload);
    return result;
  },
};

const shouldRefresh = (status: number) =>
  status === 401 || status === 403 || status === 419;

const authorizedFetch = async <T>(
  endpoint: string,
  options: RequestInit & { skipAuth?: boolean } = {},
): Promise<T> => {
  const { accessToken, refreshToken, setAuth, clearAuth } =
    useAuthStore.getState();

  const requiresAuth = options.skipAuth !== true;

  const withAuthHeader = (token: string | null) => {
    const headers = new Headers(options.headers ?? undefined);
    if (requiresAuth) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  };

  const attempt = async (token: string | null, skipRefresh = false) =>
    jsonFetch<T>(endpoint, {
      ...options,
      headers: withAuthHeader(token),
    }).catch(async (error) => {
      if (
        error instanceof ApiError &&
        shouldRefresh(error.status) &&
        !skipRefresh &&
        requiresAuth &&
        refreshToken
      ) {
        try {
          const refreshed = await authApi.refresh(refreshToken);
          setAuth(refreshed);
          return jsonFetch<T>(endpoint, {
            ...options,
            headers: withAuthHeader(refreshed.accessToken),
          });
        } catch (refreshError) {
          clearAuth();
          throw refreshError;
        }
      }
      throw error;
    });

  if (!requiresAuth) {
    return attempt(null, true);
  }

  if (!accessToken) {
    throw new Error("Unauthenticated");
  }

  return attempt(accessToken);
};

const toFormData = (payload: BoardFormPayload) => {
  const formData = new FormData();

  const requestBody = {
    title: payload.title,
    content: payload.content,
    category: payload.category,
  };

  formData.append(
    "request",
    new Blob([JSON.stringify(requestBody)], { type: "application/json" }),
  );

  if (payload.file) {
    formData.append("file", payload.file);
  }

  return formData;
};

export const boardApi = {
  list: (params: { page?: number; size?: number }) => {
    const searchParams = new URLSearchParams();
    if (params.page !== undefined)
      searchParams.set("page", String(params.page));
    if (params.size !== undefined)
      searchParams.set("size", String(params.size));

    const query = searchParams.toString();
    const endpoint = `/boards${query ? `?${query}` : ""}`;
    return authorizedFetch<BoardsResponse>(endpoint);
  },
  get: (id: number) => authorizedFetch<BoardDetail>(`/boards/${id}`),
  create: (payload: BoardFormPayload) =>
    authorizedFetch<BoardDetail>("/boards", {
      method: "POST",
      body: toFormData(payload),
      headers: undefined,
    }),
  update: (id: number, payload: BoardFormPayload) =>
    authorizedFetch<BoardDetail>(`/boards/${id}`, {
      method: "PATCH",
      body: toFormData(payload),
      headers: undefined,
    }),
  delete: (id: number) =>
    authorizedFetch<void>(`/boards/${id}`, {
      method: "DELETE",
    }),
  categories: () => authorizedFetch<CategoryDictionary>("/boards/categories"),
};

export { ApiError };
