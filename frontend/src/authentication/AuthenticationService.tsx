import axios from "axios";
import Cookies from 'js-cookie';
import React, { createContext, useContext, useMemo, ReactNode, useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;


const csrfToken = Cookies.get('csrftoken');

// Create an axios instance
export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "X-CSRFToken": csrfToken || '',  // Provide a default value if csrfToken is undefined
  },
});

// Add a request interceptor to ensure the CSRF token is always up-to-date
axiosInstance.interceptors.request.use(
  (config) => {
    const updatedCsrfToken = Cookies.get('csrftoken');  // Get the latest CSRF token before each request
    if (updatedCsrfToken) {
      config.headers['X-CSRFToken'] = updatedCsrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
  
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;  // Mark request so we don't retry infinitely
  
        const refreshToken = Cookies.get('refresh-auth');
        if (refreshToken) {
          try {
            const refreshResponse = await axiosInstance.post('/dj-rest-auth/token/refresh/', {
              refresh: refreshToken,
            });
  
            const newAccessToken = refreshResponse.data.access;
            if (newAccessToken) {
              // Save new token
              Cookies.set('jwt-auth', newAccessToken);
              axiosInstance.defaults.headers['Authorization'] = `Bearer ${newAccessToken}`;
  
              // Update the original request with new token and retry it
              originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
              return axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            console.error("Token refresh failed", refreshError);
            // Refresh also failed — logout user
            Cookies.remove('jwt-auth');
            Cookies.remove('refresh-auth');
            window.location.href = '/login';  // Force redirect to login
          }
        } else {
          console.warn("No refresh token available.");
        }
      }
  
      return Promise.reject(error);
    }
  );
interface AuthContextType {
  login: (username: string, password: string) => Promise<{ user: User }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  user: User | null;
}

interface User {
  id: number;
  username: string;
  email: string;
  profile_image?: string;  // Expect this to be a URL string
  // Add other user properties as needed
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

// Handle login
const login = async (username: string, password: string) => {
    try {
      const response = await axiosInstance.post(`/dj-rest-auth/login/`, {
        username,
        password,
      });
  
      if (response.status === 200) {
        const { access, refresh, user } = response.data;
  
        if (access && refresh) {
          axiosInstance.defaults.headers['Authorization'] = `Bearer ${access}`;
          Cookies.set('jwt-auth', access);
          Cookies.set('refresh-auth', refresh);  // <-- Save refresh token too
          setUser(user);
          setIsAuthenticated(true);
        }
  
        return { user };
      } else {
        throw new Error("Login failed.");
      }
    } catch (error: any) {
      throw error.response?.data?.detail || error.message;
    }
  };

  // Handle logout
  const logout = async () => {
    try {
      await axiosInstance.post(`/dj-rest-auth/logout/`);
      console.log("Logged out successfully");
  
      // Remove the Authorization header and clear the state
      delete axiosInstance.defaults.headers['Authorization'];
      Cookies.remove('jwt-auth');  // Remove token from cookies
      Cookies.remove('refresh-auth') 
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Persist login state across page reloads
  useEffect(() => {
    const token = Cookies.get('jwt-auth');
    if (token) {
      axiosInstance.defaults.headers['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
      // Optionally, fetch user data here if it's not already in cookies
    }
  }, []);

  const value = useMemo(
    () => ({
      login,
      logout,
      isAuthenticated,
      user,
    }),
    [isAuthenticated, user] // Dependencies
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthService
export const useAuthService = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthService must be used within an AuthProvider");
  }
  return context;
};
