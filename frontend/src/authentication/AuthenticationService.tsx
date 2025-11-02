import React, {
  // createContext,
  useMemo,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AxiosResponse, AxiosError } from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { axiosInstance } from "../services/apiClient";
import { AuthContext, User } from "../context/AuthContext";

interface LoginResponse {
  user: User;
  access: string;
  refresh: string;
}

interface LogoutResponse {
  detail: string;
}

interface ErrorResponse {
  detail?: string;
  old_password?: string[];
}

// export interface AuthContextType {
//   login: (username: string, password: string) => Promise<{ user: User }>;
//   logout: () => Promise<void>;
//   isAuthenticated: boolean;
//   user: User | null;
//   loading: boolean;
//   refreshUser: () => Promise<{ user: User } | void>;
// }

const ACCESS_TOKEN_COOKIE = "jwt-auth";
const REFRESH_TOKEN_COOKIE = "refresh-auth";
const CSRF_COOKIE_NAME = "csrftoken";

// export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (username: string, password: string): Promise<{ user: User }> => {
    const response: AxiosResponse<LoginResponse> = await axiosInstance.post(
      `/dj-rest-auth/login/`,
      { username, password }
    );

    if (response.status === 200) {
      const { access, refresh, user } = response.data;

      if (access && refresh) {
        axiosInstance.defaults.headers["Authorization"] = `Bearer ${access}`;
        Cookies.set(ACCESS_TOKEN_COOKIE, access);
        Cookies.set(REFRESH_TOKEN_COOKIE, refresh);
        setUser(user);
        setIsAuthenticated(true);
        toast.success(`Welcome, ${user.username}!`);
      }

      return { user };
    }

    // If not 200, throw to be handled by caller
    throw new Error("Login failed.");
  };

  const logout = async (): Promise<void> => {
    try {
      const response: AxiosResponse<LogoutResponse> = await axiosInstance.post(
        `/dj-rest-auth/logout/`
      );

      if (response.status === 200) {
        delete axiosInstance.defaults.headers["Authorization"];
        Cookies.remove(ACCESS_TOKEN_COOKIE);
        Cookies.remove(REFRESH_TOKEN_COOKIE);
        Cookies.remove(CSRF_COOKIE_NAME);
        setUser(null);
        setIsAuthenticated(false);
        toast.success("Logged out successfully.");
      } else {
        // Non-200 responses are unexpected — throw to bubble up to catch below
        throw new Error("Logout failed.");
      }
    } catch {
      // Intentionally not exposing internal error details to the user
      toast.error("Logout failed. Please try again.");
    }
  };

  const refreshUser = async (): Promise<{ user: User } | void> => {
    try {
      const response = await axiosInstance.get<User>("/dj-rest-auth/user/");
      setUser(response.data);
      return { user: response.data };
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<ErrorResponse>;
      const message = axiosErr.response?.data?.detail ?? "Failed to fetch user";
      toast.error(message);
    }
  };

  useEffect(() => {
    const token = Cookies.get(ACCESS_TOKEN_COOKIE);
    if (token) {
      axiosInstance.defaults.headers["Authorization"] = `Bearer ${token}`;
      setIsAuthenticated(true);
      // fire and forget; errors handled inside refreshUser
      void refreshUser();
    }
    setLoading(false);
  }, []);

  const value = useMemo(
    () => ({ login, logout, isAuthenticated, user, loading, refreshUser }),
    [isAuthenticated, user, loading] // ✅ fixed exhaustive-deps
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
