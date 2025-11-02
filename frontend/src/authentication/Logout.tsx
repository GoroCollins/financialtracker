import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthService } from '../hooks/useAuthService';
import { toast } from "sonner";
import { AxiosError } from "axios";

interface LogoutErrorResponse {
  detail?: string;
}

const Logout: React.FC = () => {
  const { logout } = useAuthService();
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logout(); 
        toast.success('Logged out successfully.');
        navigate('/'); 
      } catch (err) {
        const error = err as AxiosError<LogoutErrorResponse>;
        const message = error.response?.data?.detail || error.message || "Logout failed.";
        toast.error(`Logout failed: ${message}`);
      }
    };

    handleLogout();
  }, [logout, navigate]);

  return <div>Logging out...</div>;
};

export default Logout;