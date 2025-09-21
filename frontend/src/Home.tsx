import React from 'react';
import { useAuthService } from './authentication/AuthenticationService';
import useSWR from 'swr';
import { fetcher } from './utils/swrFetcher';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid,} from 'recharts';

const Home: React.FC = () => {
  const { user } = useAuthService();
  const {data: localCurrency, error: localcurrencyError, isLoading: localcurrencyLoading} = useSWR('/api/currencies/get-localcurrency', fetcher);
  const { data: incomeTotals, error: incometotalsError, isLoading: incometotalsLoading } = useSWR('/api/income/totalincome', fetcher);
  const { data: assetsTotals, error: assetstotalsError, isLoading: assetstotalsLoading } = useSWR('/api/assets/totalassets', fetcher);
  const { data: expensesTotals, error: expensestotalsError, isLoading: expensestotalsLoading } = useSWR('/api/expenses/totalexpenses', fetcher);
  const { data: liabilitiesTotals, error: liabilitiestotalsError, isLoading: liabilitiestotalsLoading } = useSWR('/api/liabilities/totalliabilities', fetcher);
  const [expandedSection, setExpandedSection] = React.useState<string | null>(null);
  const toggleSection = (section: string) => {
    setExpandedSection(prev => (prev === section ? null : section));
  };
  const formatCurrency = (amount: number) => `${localCurrency.local_currency_code} ${amount.toFixed(2)}`;
  
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
    <>
    <div className="container mt-5">
      <h2>{getGreeting()} {user?.full_name ? capitalize(user.full_name) : 'there'}, welcome</h2>
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
          <h4>Your Total Income: 
            <a onClick={() => toggleSection('income')} role="button" tabIndex={0} className="text-blue-600 underline ml-1 cursor-pointer">
              {localCurrency.local_currency_code} {Number(incomeTotals.total_income).toFixed(2)}
            </a>  
          </h4>
          {expandedSection === 'income' && (
            <ul className="mt-2">
            <li>Earned Income: {localCurrency.local_currency_code} {Number(incomeTotals.earned_income).toFixed(2)}</li>
            <li>Portfolio Income: {localCurrency.local_currency_code} {Number(incomeTotals.portfolio_income).toFixed(2)}</li>
            <li>Passive Income: {localCurrency.local_currency_code} {Number(incomeTotals.passive_income).toFixed(2)}</li>
          </ul>
          )}
        </div>
      )}

      {assetsTotals && localCurrency &&  (
        <div className="mt-4">
          <h4>Your Total Assets:
            <a onClick={() => toggleSection('assets')} role="button" tabIndex={0} className="text-blue-600 underline ml-1 cursor-pointer">
              {localCurrency.local_currency_code} {Number(assetsTotals.total_assets).toFixed(2)}
            </a> 
          </h4>
          {expandedSection === 'assets' && (
            <ul className="mt-2">
            <li>Liquid Assets: {localCurrency.local_currency_code} {Number(assetsTotals.liquid_assets).toFixed(2)}</li>
            <li>Equities: {localCurrency.local_currency_code} {Number(assetsTotals.equities).toFixed(2)}</li>
            <li>Investment Accounts: {localCurrency.local_currency_code} {Number(assetsTotals.investment_accounts).toFixed(2)}</li>
            <li>Retirement Accounts: {localCurrency.local_currency_code} {Number(assetsTotals.retirement_accounts).toFixed(2)}</li>
          </ul>
          )}
        </div>
      )}

      {expensesTotals && localCurrency &&  (
        <div className="mt-4">
          <h4>Your Total Expenses:
            <a onClick={() => toggleSection('expenses')} role="button" tabIndex={0} className="text-blue-600 underline ml-1 cursor-pointer">
              {localCurrency.local_currency_code} {Number(expensesTotals.total_expenses).toFixed(2)}
            </a>
          </h4>
          {expandedSection === 'expenses' && (
            <ul className="mt-2">
            <li>Fixed Expenses: {localCurrency.local_currency_code} {Number(expensesTotals.fixed_expenses).toFixed(2)}</li>
            <li>Variable Expenses: {localCurrency.local_currency_code} {Number(expensesTotals.variable_expenses).toFixed(2)}</li>
            <li>Discretionary Expenses: {localCurrency.local_currency_code} {Number(expensesTotals.discretionary_expenses).toFixed(2)}</li>
          </ul>
          )}
        </div>
      )}

      {liabilitiesTotals && localCurrency && (
        <div className="mt-4">
          <h4>Your Total Liabilities:
            <a onClick={() => toggleSection('liabilities')} role="button" tabIndex={0} className="text-blue-600 underline ml-1 cursor-pointer">
              {localCurrency.local_currency_code} {Number(liabilitiesTotals.total_liabilities).toFixed(2)}
            </a>
          </h4>
          {expandedSection === 'liabilities' && (
            <ul className="mt-2">
              <li>Loans: {localCurrency.local_currency_code} {Number(liabilitiesTotals.loans).toFixed(2)}</li>
          </ul>
          )}
        </div>
      )}
    </div>
    {/* // Inside your return JSX */}
{incomeTotals && assetsTotals && expensesTotals && liabilitiesTotals && localCurrency && (
  <div className="mt-6">
    <h4 className="mb-2">Financial Overview</h4>
      <ResponsiveContainer width="100%" height={300}>
       <BarChart
          data={[
            { name: 'Income', value: incomeTotals.total_income, key: 'income' },
            { name: 'Assets', value: assetsTotals.total_assets, key: 'assets' },
            { name: 'Expenses', value: expensesTotals.total_expenses, key: 'expenses' },
            { name: 'Liabilities', value: liabilitiesTotals.total_liabilities, key: 'liabilities' },
          ]}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          onClick={(e) => {
            // Define the expected shape with optional chaining for safety
            const payload = (e as {
              activePayload?: { payload?: { key?: string } }[];
            })?.activePayload?.[0]?.payload;

            const section = payload?.key;
            if (section) toggleSection(section);
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            labelFormatter={(label) => label} // Keep name like "Income"
          />
          <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>


    {expandedSection === 'income' && (
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={[
              { name: 'Earned', value: incomeTotals.earned_income },
              { name: 'Portfolio', value: incomeTotals.portfolio_income },
              { name: 'Passive', value: incomeTotals.passive_income },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Line type="monotone" dataKey="value" stroke="#10b981" activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )}

    {expandedSection === 'assets' && (
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={[
              { name: 'Liquid', value: assetsTotals.liquid_assets },
              { name: 'Equities', value: assetsTotals.equities },
              { name: 'Investments', value: assetsTotals.investment_accounts },
              { name: 'Retirement', value: assetsTotals.retirement_accounts },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Line type="monotone" dataKey="value" stroke="#6366f1" activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )}

    {expandedSection === 'expenses' && (
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={[
              { name: 'Fixed', value: expensesTotals.fixed_expenses },
              { name: 'Variable', value: expensesTotals.variable_expenses },
              { name: 'Discretionary', value: expensesTotals.discretionary_expenses },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Line type="monotone" dataKey="value" stroke="#dc2626" activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )}

    {expandedSection === 'liabilities' && (
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={[
              { name: 'Loans', value: liabilitiesTotals.loans },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Line type="monotone" dataKey="value" stroke="#6b7280" activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )}
  </div>
)}

</>
  );
};

export default Home;
