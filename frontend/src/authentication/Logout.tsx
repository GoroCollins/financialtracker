import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthService } from './AuthenticationService';

const Logout: React.FC = () => {
  const { logout } = useAuthService();
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logout();  // Log the user out
        navigate('/');   // Redirect to homepage after logout
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };

    handleLogout();
  }, [logout, navigate]);

  return (
    <div>
      Logging out...
    </div>
  );
};

export default Logout;