import { useContext } from "react";
import { AuthContext, AuthContextType } from "../context/AuthContext";

export const useAuthService = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthService must be used within an AuthProvider");
  }
  return context;
};