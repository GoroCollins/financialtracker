import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import { axiosInstance } from '../authentication/AuthenticationService';
import { Currency } from '../utils/zodSchemas';
// Simple fallback for merging class names if '@/lib/utils' does not exist
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

const fetcher = (url: string) => axiosInstance.get(url).then((res) => res.data);

const PAGE_SIZE = 15;

export default function CurrenciesList() {
  const { data: currencies, error } = useSWR<Currency[]>('/api/currencies/currencies/', fetcher);

  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || localStorage.getItem('activeCurrencyTab') || 'local';
  const [activeTab, setActiveTab] = useState<'local' | 'other'>(defaultTab as 'local' | 'other');

  const [otherPage, setOtherPage] = useState(1);

  useEffect(() => {
    setSearchParams({ tab: activeTab });
    localStorage.setItem('activeCurrencyTab', activeTab);
  }, [activeTab, setSearchParams]);

  if (error) return <div>Error loading currencies.</div>;
  if (!currencies) return <div>Loading...</div>;

  const localCurrency = currencies.find((c) => c.is_local);
  const otherCurrencies = currencies.filter((c) => !c.is_local);

  const start = (otherPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const paginatedOthers = otherCurrencies.slice(start, end);
  const hasNext = end < otherCurrencies.length;
  const hasPrev = otherPage > 1;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Currencies</h1>

      {/* Accordion */}
      <div className="space-y-2">
        {/* Local Currency Accordion */}
        <div>
          <button
            onClick={() => setActiveTab('local')}
            className="w-full flex justify-between items-center bg-gray-100 hover:bg-gray-200 px-4 py-2 text-left rounded transition"
          >
            <span className="font-semibold">Local Currency</span>
            <span>{activeTab === 'local' ? '▲' : '▼'}</span>
          </button>
          <div
            className={cn(
              'overflow-hidden transition-all duration-300',
              activeTab === 'local' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            )}
          >
            <div className="p-4 border rounded-b">
              {localCurrency ? (
                <Link
                  to={`/currencies/${localCurrency.code}`}
                  className="text-lg font-semibold text-green-700 hover:underline"
                >
                  {localCurrency.code} - {localCurrency.description} (Local)
                </Link>
              ) : (
                <div className="text-red-600">⚠️ No local currency defined.</div>
              )}
            </div>
          </div>
        </div>

        {/* Other Currencies Accordion */}
        <div>
          <button
            onClick={() => setActiveTab('other')}
            className="w-full flex justify-between items-center bg-gray-100 hover:bg-gray-200 px-4 py-2 text-left rounded transition"
          >
            <span className="font-semibold">Other Currencies ({otherCurrencies.length})</span>
            <span>{activeTab === 'other' ? '▲' : '▼'}</span>
          </button>
          <div
            className={cn(
              'overflow-hidden transition-all duration-300',
              activeTab === 'other' ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            )}
          >
            <ul className="p-4 space-y-2 border rounded-b">
              {paginatedOthers.map((currency) => (
                <li key={currency.code} className="border p-2 rounded hover:bg-gray-50 transition">
                  <Link to={`/currencies/${currency.code}`} className="text-lg font-medium">
                    {currency.code} - {currency.description}
                  </Link>
                </li>
              ))}

              {/* Pagination Controls */}
              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={() => setOtherPage((p) => p - 1)}
                  disabled={!hasPrev}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span>Page {otherPage}</span>
                <button
                  onClick={() => setOtherPage((p) => p + 1)}
                  disabled={!hasNext}
                  className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
