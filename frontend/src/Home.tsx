import React from 'react';
import { useAuthService } from './authentication/AuthenticationService';
import useSWR from 'swr';
import { fetcher } from './utils/swrFetcher';

const Home: React.FC = () => {
  const { user } = useAuthService();
  const {data: localCurrency, error: localcurrencyError, isLoading: localcurrencyLoading} = useSWR('/api/currencies/get-localcurrency', fetcher);
  const { data: incomeTotals, error: incometotalsError, isLoading: incometotalsLoading } = useSWR('/api/income/totalincome', fetcher);
  const { data: assetsTotals, error: assetstotalsError, isLoading: assetstotalsLoading } = useSWR('/api/assets/totalassets', fetcher);
  const { data: expensesTotals, error: expensestotalsError, isLoading: expensestotalsLoading } = useSWR('/api/expenses/totalexpenses', fetcher);
  const { data: liabilitiesTotals, error: liabilitiestotalsError, isLoading: liabilitiestotalsLoading } = useSWR('/api/liabilities/totalliabilities', fetcher);

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  };
  if (!localCurrency) return <p>Loading currency data...</p>;
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
      {assetstotalsLoading && <p>Loading total assets...</p>}
      {assetstotalsError && <p className="text-danger">Failed to load assets data.</p>}
      {expensestotalsLoading && <p>Loading total expenses...</p>}
      {expensestotalsError && <p className="text-danger">Failed to load expenses data.</p>}
      {liabilitiestotalsLoading && <p>Loading total liabilities...</p>}
      {liabilitiestotalsError && <p className="text-danger">Failed to load liabilities data.</p>}

      {incomeTotals && localCurrency && (
        <div className="mt-4">
          <h4>Your Total Income: {localCurrency.local_currency_code} {Number(incomeTotals.total_income).toFixed(2)}</h4>
          <ul className="mt-2">
            <li>Earned Income: {localCurrency.local_currency_code} {Number(incomeTotals.earned_income).toFixed(2)}</li>
            <li>Portfolio Income: {localCurrency.local_currency_code} {Number(incomeTotals.portfolio_income).toFixed(2)}</li>
            <li>Passive Income: {localCurrency.local_currency_code} {Number(incomeTotals.passive_income).toFixed(2)}</li>
          </ul>
        </div>
      )}

      {assetsTotals && localCurrency &&  (
        <div className="mt-4">
          <h4>Your Total Assets: {localCurrency.local_currency_code} {Number(assetsTotals.total_assets).toFixed(2)}</h4>
          <ul className="mt-2">
            <li>Liquid Assets: {localCurrency.local_currency_code} {Number(assetsTotals.liquid_assets).toFixed(2)}</li>
            <li>Equities: {localCurrency.local_currency_code} {Number(assetsTotals.equities).toFixed(2)}</li>
            <li>Investment Accounts: {localCurrency.local_currency_code} {Number(assetsTotals.investment_accounts).toFixed(2)}</li>
            <li>Retirement Accounts: {localCurrency.local_currency_code} {Number(assetsTotals.retirement_accounts).toFixed(2)}</li>
          </ul>
        </div>
      )}

      {expensesTotals && localCurrency &&  (
        <div className="mt-4">
          <h4>Your Total Expenses: {localCurrency.local_currency_code} {Number(expensesTotals.total_expenses).toFixed(2)}</h4>
          <ul className="mt-2">
            <li>Fixed Expenses: {localCurrency.local_currency_code} {Number(expensesTotals.fixed_expenses).toFixed(2)}</li>
            <li>Variable Expenses: {localCurrency.local_currency_code} {Number(expensesTotals.variable_expenses).toFixed(2)}</li>
            <li>Discretionary Expenses: {localCurrency.local_currency_code} {Number(expensesTotals.discretionary_expenses).toFixed(2)}</li>
          </ul>
        </div>
      )}

      {liabilitiesTotals && localCurrency && (
        <div className="mt-4">
          <h4>Your Total Liabilities: {localCurrency.local_currency_code} {Number(liabilitiesTotals.total_liabilities).toFixed(2)}</h4>
          <ul className="mt-2">
            <li>Loans: {localCurrency.local_currency_code} {Number(liabilitiesTotals.loans).toFixed(2)}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Home;
