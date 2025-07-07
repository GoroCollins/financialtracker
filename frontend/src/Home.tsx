import React from 'react';
import { useAuthService } from './authentication/AuthenticationService';
import useSWR from 'swr';
import { fetcher } from './utils/swrFetcher';

const Home: React.FC = () => {
  const { user } = useAuthService();
  const { data: incomeTotals, error: incometotalsError, isLoading: incometotalsLoading } = useSWR('/api/income/totalincome', fetcher);
  const {data: localCurrency, error: localcurrencyError, isLoading: localcurrencyLoading} = useSWR('/api/currencies/get-localcurrency', fetcher);

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
      <h2>{getGreeting()} {user?.full_name ? capitalize(user.full_name) : 'there'}, welcome to home page </h2>
      {localcurrencyError && <p className="text-danger">Failed to load local currency.</p>}
      {localcurrencyLoading && <p>Loading local currency...</p>}
      {incometotalsLoading && <p>Loading total income...</p>}
      {incometotalsError && <p className="text-danger">Failed to load income data.</p>}

      {incomeTotals && (
        <div className="mt-4">
          <h4>Your Total Income: {localCurrency} {Number(incomeTotals.total_income).toFixed(2)}</h4>
          <ul className="mt-2">
            <li>Earned Income: {localCurrency} {Number(incomeTotals.earned_income).toFixed(2)}</li>
            <li>Portfolio Income: {localCurrency} {Number(incomeTotals.portfolio_income).toFixed(2)}</li>
            <li>Passive Income: {localCurrency} {Number(incomeTotals.passive_income).toFixed(2)}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Home;
