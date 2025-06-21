import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthService } from './AuthenticationService';
import { toast } from "react-hot-toast";

const Logout: React.FC = () => {
  const { logout } = useAuthService();
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logout();  // Log the user out
        toast.success('Logged out successfully.');
        navigate('/');   // Redirect to homepage after logout
      } catch (error: any) {
        const message = error?.response?.data?.detail || error?.message || 'Logout failed.';
        toast.error(`Logout failed: ${message}`);
      }
    };

    handleLogout();
  }, [logout, navigate]);

  return <div>Logging out...</div>;
};

export default Logout;