import useSWR from 'swr';
import { Link } from 'react-router-dom';
import { axiosInstance } from '../authentication/AuthenticationService';
import { Currency } from '../utils/zodSchemas';


const fetcher = (url: string) => axiosInstance.get(url).then(res => res.data);

export default function CurrenciesList() {
  const { data: currencies, error } = useSWR<Currency[]>('/api/currencies/currencies/', fetcher);

  if (error) return <div>Error loading currencies.</div>;
  if (!currencies) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Currencies</h1>
      <Link to="/currencies/create" className="text-blue-600 underline mb-4 block">+ Create Currency</Link>
      <ul className="space-y-2">
        {currencies.map((currency) => (
          <li key={currency.code} className="border p-2 rounded">
            <Link to={`/currencies/${currency.code}`} className="text-lg font-semibold">
              {currency.code} - {currency.description} {currency.is_local && <span className="text-green-600">(Local)</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}