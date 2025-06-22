import React from 'react';
import { useAuthService } from './authentication/AuthenticationService';

const Home: React.FC = () => {
  const { user } = useAuthService();

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  const capitalize = (full_name: string) => full_name.charAt(0).toUpperCase() + full_name.slice(1);

  return (
    <div className="container mt-5">
      <h2>
        {getGreeting()} {user?.full_name ? capitalize(user.full_name) : 'there'}, welcome to home page
      </h2>
    </div>
  );
};

export default Home;
