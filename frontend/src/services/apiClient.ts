import axios, { AxiosInstance } from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { navigateToLogin } from "@/services/navigation";
import { extractErrorMessage } from "../utils/errorHandler";

const API_URL = import.meta.env.VITE_API_URL;
const ACCESS_TOKEN_COOKIE = "jwt-auth";
const REFRESH_TOKEN_COOKIE = "refresh-auth";
const CSRF_COOKIE_NAME = "csrftoken";


export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Keep CSRF updated
axiosInstance.interceptors.request.use(
  (config) => {
    const csrfToken = Cookies.get(CSRF_COOKIE_NAME);
    const accessToken = Cookies.get(ACCESS_TOKEN_COOKIE);

    if (csrfToken) {
      config.headers = config.headers ?? {};
      config.headers["X-CSRFToken"] = csrfToken;
    }

    if (accessToken) {
      config.headers = config.headers ?? {};
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired tokens globally
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = Cookies.get(REFRESH_TOKEN_COOKIE);

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/dj-rest-auth/token/refresh/`, {
            refresh: refreshToken,
          });

          if (data.access && data.refresh) {
            Cookies.set(ACCESS_TOKEN_COOKIE, data.access);
            Cookies.set(REFRESH_TOKEN_COOKIE, data.refresh);
            axiosInstance.defaults.headers = axiosInstance.defaults.headers ?? {};
            axiosInstance.defaults.headers["Authorization"] = `Bearer ${data.access}`;
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers["Authorization"] = `Bearer ${data.access}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          const message = extractErrorMessage(refreshError);
          toast.error(message);
          Cookies.remove(ACCESS_TOKEN_COOKIE);
          Cookies.remove(REFRESH_TOKEN_COOKIE);
          // window.location.href = "/login";
          navigateToLogin();
        }
      }
    }

    // if (
    //   !originalRequest?.url?.includes("/token/refresh/") &&
    //   !originalRequest?.url?.includes("/login/")
    // ) {
    //   toast.error(extractErrorMessage(error));
    // }
    if (
      !originalRequest._retry &&
      !originalRequest?.url?.includes("/token/refresh/") &&
      !originalRequest?.url?.includes("/login/")
    ) {
      toast.error(extractErrorMessage(error));
    }

    return Promise.reject(error);
  }
);
