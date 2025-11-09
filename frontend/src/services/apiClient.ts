import axios, { AxiosInstance } from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { extractErrorMessage } from "../utils/errorHandler";

const API_URL = import.meta.env.VITE_API_URL;
const ACCESS_TOKEN_COOKIE = "jwt-auth";
const REFRESH_TOKEN_COOKIE = "refresh-auth";
const CSRF_COOKIE_NAME = "csrftoken";

// const csrfToken = Cookies.get(CSRF_COOKIE_NAME);

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    // "X-CSRFToken": csrfToken || "",
  },
});

// Keep CSRF updated
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const accessToken = Cookies.get(ACCESS_TOKEN_COOKIE);
//     if (accessToken) {
//       config.headers["Authorization"] = `Bearer ${accessToken}`;
//     }
//     const updatedToken = Cookies.get(CSRF_COOKIE_NAME);
//     if (updatedToken) config.headers["X-CSRFToken"] = updatedToken;
//     return config;
//   },
//   (error) => Promise.reject(error)
// );
axiosInstance.interceptors.request.use(
  (config) => {
    const csrfToken = Cookies.get(CSRF_COOKIE_NAME);
    const accessToken = Cookies.get(ACCESS_TOKEN_COOKIE);

    if (csrfToken) config.headers["X-CSRFToken"] = csrfToken;
    if (accessToken) config.headers["Authorization"] = `Bearer ${accessToken}`;

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

          if (data.access) {
            Cookies.set(ACCESS_TOKEN_COOKIE, data.access);
            axiosInstance.defaults.headers["Authorization"] = `Bearer ${data.access}`;
            originalRequest.headers["Authorization"] = `Bearer ${data.access}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          const navigate = useNavigate();
          const message = extractErrorMessage(refreshError);
          toast.error(message);
          Cookies.remove(ACCESS_TOKEN_COOKIE);
          Cookies.remove(REFRESH_TOKEN_COOKIE);
          // window.location.href = "/login";
          navigate("/login", { replace: true });
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
