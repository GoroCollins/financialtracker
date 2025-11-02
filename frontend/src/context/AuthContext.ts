import { createContext } from "react";

export interface User {
  id: number;
  username: string;
  email: string;
  profile_image?: string;
  full_name?: string;
}

export interface AuthContextType {
  login: (username: string, password: string) => Promise<{ user: User }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<{ user: User } | void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
