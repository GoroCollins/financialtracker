import axios, { AxiosResponse, AxiosInstance } from "axios";
import Cookies from "js-cookie";
import React, {
  createContext,
  useContext,
  useMemo,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { toast } from "sonner";
import { extractErrorMessage } from "../utils/errorHandler";

const API_URL = import.meta.env.VITE_API_URL;

const ACCESS_TOKEN_COOKIE = "jwt-auth";
const REFRESH_TOKEN_COOKIE = "refresh-auth";
const CSRF_COOKIE_NAME = "csrftoken";

const csrfToken = Cookies.get(CSRF_COOKIE_NAME);

// Create an axios instance
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "X-CSRFToken": csrfToken || "", // Provide a default value if csrfToken is undefined
  },
});

// Add a request interceptor to ensure the CSRF token is always up-to-date
axiosInstance.interceptors.request.use(
  (config) => {
    const updatedCsrfToken = Cookies.get(CSRF_COOKIE_NAME); // Get the latest CSRF token before each request
    if (updatedCsrfToken) {
      config.headers["X-CSRFToken"] = updatedCsrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle expired tokens (401 errors) and token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark request so we don't retry infinitely

      const refreshToken = Cookies.get(REFRESH_TOKEN_COOKIE);
      if (refreshToken) {
        try {
          const refreshResponse = await axiosInstance.post(
            "/dj-rest-auth/token/refresh/",
            {
              refresh: refreshToken,
            }
          );

          const newAccessToken = refreshResponse.data.access;
          if (newAccessToken) {
            // Save new token
            Cookies.set(ACCESS_TOKEN_COOKIE, newAccessToken); // add this for HTTPS { secure: true, sameSite: 'strict' }
            axiosInstance.defaults.headers[
              "Authorization"
            ] = `Bearer ${newAccessToken}`;

            // Update the original request with new token and retry it
            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${newAccessToken}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          console.error("Token refresh failed", refreshError);
          // Refresh also failed — logout user
          Cookies.remove(ACCESS_TOKEN_COOKIE);
          Cookies.remove(REFRESH_TOKEN_COOKIE);
          window.location.href = "/login"; // Force redirect to login
        }
      } else {
        console.warn("No refresh token available.");
      }
    }
    // ✅ Show toast for all other failed requests (except refresh and login)
    if (
      !originalRequest?.url?.includes("/token/refresh/") &&
      !originalRequest?.url?.includes("/login/") &&
      !originalRequest?.suppressGlobalError
    ) {
      const message = extractErrorMessage(error);
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

interface AuthContextType {
  login: (username: string, password: string) => Promise<{ user: User }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<{ user: User } | void>;
}

interface User {
  id: number;
  username: string;
  email: string;
  profile_image?: string; // Expect this to be a URL string
  full_name?: string;
  // Add other user properties as needed
}

interface LoginResponse {
  user: User;
  access: string; // Access token
  refresh: string; // Refresh token
}

interface LogoutResponse {
  detail: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle login
  const login = async (
    username: string,
    password: string
  ): Promise<{ user: User }> => {
    try {
      const response: AxiosResponse<LoginResponse> = await axiosInstance.post(
        `/dj-rest-auth/login/`,
        {
          username,
          password,
        }
      );

      if (response.status === 200) {
        const { access, refresh, user } = response.data;

        if (access && refresh) {
          axiosInstance.defaults.headers["Authorization"] = `Bearer ${access}`;
          Cookies.set(ACCESS_TOKEN_COOKIE, access); // add this for HTTPS { secure: true, sameSite: 'strict' }
          Cookies.set(REFRESH_TOKEN_COOKIE, refresh); // <-- Save refresh token too add this for HTTPS { secure: true, sameSite: 'strict' }
          setUser(user);
          setIsAuthenticated(true);
          toast.success(`Welcome, ${user.username}!`);
        }

        return { user };
      } else {
        throw new Error("Login failed.");
      }
    } catch (error: any) {
      throw error;
    }
  };

  // Handle logout
  const logout = async (): Promise<void> => {
    try {
      const response: AxiosResponse<LogoutResponse> = await axiosInstance.post(
        `/dj-rest-auth/logout/`
      );
      if (response.status === 200) {
        delete axiosInstance.defaults.headers["Authorization"];
        Cookies.remove(ACCESS_TOKEN_COOKIE); // Remove token from cookies
        Cookies.remove(REFRESH_TOKEN_COOKIE); // Remove refresh token from cookies
        Cookies.remove(CSRF_COOKIE_NAME); //  Remove CSRF token if needed
        setUser(null);
        setIsAuthenticated(false);
        toast.success("Logged out successfully.");
      } else {
        throw new Error("Logout failed.");
      }
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  };

  const refreshUser = async (): Promise<{ user: User } | void> => {
    try {
      const response = await axiosInstance.get("/dj-rest-auth/user/");
      setUser(response.data);
      return { user: response.data };
    } catch (error) {
      toast.error("Failed to fetch user");
    }
  };

  // Persist login state across page reloads
  useEffect(() => {
    const token = Cookies.get(ACCESS_TOKEN_COOKIE);
    if (token) {
      axiosInstance.defaults.headers["Authorization"] = `Bearer ${token}`;
      setIsAuthenticated(true);
      refreshUser(); // Optionally, fetch user data here if it's not already in cookies
    }
    setLoading(false); // Done loading
  }, []);

  const value = useMemo(
    () => ({
      login,
      logout,
      isAuthenticated,
      user,
      loading,
      refreshUser,
    }),
    [isAuthenticated, user] // Dependencies
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthService
export const useAuthService = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthService must be used within an AuthProvider");
  }
  return context;
};
