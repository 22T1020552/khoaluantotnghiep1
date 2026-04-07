import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8081";
const AUTH_STORAGE_KEY = "clinic-auth-session";

export interface StoredAuthSession {
  token: string;
  refreshToken?: string;
  username: string;
  role: string;
}

export const getStoredAuthSession = (): StoredAuthSession | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as StoredAuthSession;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export const saveStoredAuthSession = (session: StoredAuthSession) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

export const clearStoredAuthSession = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const getStoredToken = () => getStoredAuthSession()?.token ?? null;

const isAuthEndpoint = (url?: string) => {
  if (!url) {
    return false;
  }

  return [
    "/api/auth/login",
    "/api/auth/register/patient",
    "/api/auth/refresh",
    "/api/auth/logout",
    "/api/auth/forgot-password/send-otp",
    "/api/auth/forgot-password/verify-otp",
    "/api/auth/forgot-password/reset",
  ].some((endpoint) => url.includes(endpoint));
};

const normalizeRole = (role: unknown) => String(role ?? "").toUpperCase();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  return config;
});

type QueuedRequest = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let isRefreshingToken = false;
let queuedRequests: QueuedRequest[] = [];

const resolveQueuedRequests = (token: string) => {
  queuedRequests.forEach(({ resolve }) => resolve(token));
  queuedRequests = [];
};

const rejectQueuedRequests = (error: unknown) => {
  queuedRequests.forEach(({ reject }) => reject(error));
  queuedRequests = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const status = error.response?.status;

    if (!originalRequest || status !== 401 || originalRequest._retry || isAuthEndpoint(originalRequest.url)) {
      return Promise.reject(error);
    }

    const session = getStoredAuthSession();
    if (!session?.refreshToken) {
      clearStoredAuthSession();
      return Promise.reject(error);
    }

    if (isRefreshingToken) {
      return new Promise((resolve, reject) => {
        queuedRequests.push({
          resolve: (newAccessToken: string) => {
            originalRequest.headers = originalRequest.headers ?? {};
            (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${newAccessToken}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshingToken = true;

    try {
      const refreshResponse = await axios.post<StoredAuthSession>(
        `${API_BASE_URL}/api/auth/refresh`,
        { refreshToken: session.refreshToken },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const refreshedSession: StoredAuthSession = {
        token: refreshResponse.data.token,
        refreshToken: refreshResponse.data.refreshToken,
        username: refreshResponse.data.username,
        role: normalizeRole(refreshResponse.data.role),
      };

      saveStoredAuthSession(refreshedSession);
      resolveQueuedRequests(refreshedSession.token);

      originalRequest.headers = originalRequest.headers ?? {};
      (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${refreshedSession.token}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearStoredAuthSession();
      rejectQueuedRequests(refreshError);
      return Promise.reject(refreshError);
    } finally {
      isRefreshingToken = false;
    }
  },
);

export const getApiErrorMessage = (error: unknown, fallback = "Không thể kết nối tới máy chủ") => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | { message?: string; error?: string; details?: string | Record<string, string> }
      | string
      | undefined;

    if (typeof responseData === "string") {
      return responseData;
    }

    if (responseData?.message) {
      return responseData.message;
    }

    if (responseData?.error) {
      return responseData.error;
    }

    if (responseData?.details) {
      if (typeof responseData.details === "string") {
        return responseData.details;
      }

      const firstDetail = Object.values(responseData.details)[0];
      if (firstDetail) {
        return firstDetail;
      }
    }

    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};
