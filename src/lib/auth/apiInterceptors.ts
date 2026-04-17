import axios, { type AxiosInstance } from "axios";
import { clearSession, getAccessToken, getCsrfToken } from "@/lib/auth/session";

type ApplyAuthInterceptorsOptions = {
  redirectOn401?: boolean;
  skipRedirectPaths?: string[];
};

let unauthorizedRedirecting = false;

const shouldSkipRedirect = (url: string | undefined, skipPaths: string[]) => {
  if (!url) return false;
  return skipPaths.some((path) => url.includes(path));
};

const redirectToLogin = () => {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/login")) return;
  if (unauthorizedRedirecting) return;

  unauthorizedRedirecting = true;
  clearSession();

  const nextPath = `${window.location.pathname}${window.location.search}`;
  window.location.replace(`/login?next=${encodeURIComponent(nextPath)}`);
};

export const applyAuthInterceptors = (api: AxiosInstance, options?: ApplyAuthInterceptorsOptions) => {
  const redirectOn401 = options?.redirectOn401 ?? true;
  const skipRedirectPaths = options?.skipRedirectPaths ?? [];

  api.interceptors.request.use((config) => {
    config.withCredentials = true;

    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const method = (config.method || "get").toLowerCase();
    const isMutating =
      method === "post" || method === "put" || method === "patch" || method === "delete";

    if (isMutating) {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken;
      }
    }

    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (
        redirectOn401 &&
        axios.isAxiosError(error) &&
        error.response?.status === 401 &&
        !shouldSkipRedirect(error.config?.url, skipRedirectPaths)
      ) {
        redirectToLogin();
      }
      return Promise.reject(error);
    }
  );

  return api;
};
