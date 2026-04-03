import axios, { type AxiosInstance } from "axios";
import { clearSession, getAccessToken, getCsrfToken } from "@/lib/auth/session";

type ApplyAuthInterceptorsOptions = {
  redirectOn401?: boolean; // 무엇인가 컨트롤하는데에 사용될 boolean 값.
  skipRedirectPaths?: string[]; // 경로 리스트를 string[] 형태로 저장.
};

let unauthorizedRedirecting = false;

const shouldSkipRedirect = (url: string | undefined, skipPaths: string[]) => {
  if (!url) 
    return false;

  return skipPaths.some((path) => url.includes(path));
};

const redirectToLogin = () => {
  if (typeof window === "undefined") 
    return;
  if (unauthorizedRedirecting) 
    return;

  unauthorizedRedirecting = true; // 이거 걸리고 나니까 401을 여러번 호출시키지 않는다.

  clearSession();
  
  window.location.replace("/login");
};

// 프론트에서 백엔드로 보내는 요청을 가로채서, 헤더 2가지를 붙임
// Bearer는 Who를 담고,
// XSRF-TOKEN(Backend에서 발급한 sid를 암호화)은 Where(Backend)를 담음.)
export const applyAuthInterceptors = (api: AxiosInstance, options?: ApplyAuthInterceptorsOptions) => 
  {
  const redirectOn401 = options?.redirectOn401 ?? true;
  const skipRedirectPaths = options?.skipRedirectPaths ?? [];

  // 요청처리를 위한 코드 
  api.interceptors.request.use((config) => {
    config.withCredentials = true;

    const token = getAccessToken(); // his.accessToken 이 토큰 값을 token변수로 저장.

    if (token) {
      config.headers.Authorization = `Bearer ${token}`; 
    }

    const method = (config.method || "get").toLowerCase();
    const isMutating = method === "post" || method === "put" || method === "patch" || method === "delete";
    if (isMutating) 
      {
      const csrfToken = getCsrfToken();
      
      if (csrfToken) 
          {
          config.headers["X-CSRF-Token"] = csrfToken;
        }
    }

    return config;
  });

  //결과처리를 위한 코드
  api.interceptors.response.use((response) => {return response},
    (error) => 
      {
      
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
