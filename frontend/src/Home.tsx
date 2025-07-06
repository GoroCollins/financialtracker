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
  // Function to capitalize each word in the full name by splitting the full name by spaces, capitalizes the first letter of each word
  // and then joins them back together.
  const capitalize = (full_name: string) => full_name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className="container mt-5">
      <h2>
        {getGreeting()} {user?.full_name ? capitalize(user.full_name) : 'there'}, welcome to home page
      </h2>
    </div>
  );
};

export default Home;
