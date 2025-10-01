import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { CurrencySchema, CurrencyFormData, ExchangeRate } from '../utils/zodSchemas';
import { axiosInstance } from '../authentication/AuthenticationService';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import ConfirmModal from '../ConfirmModal';
import useSWR from 'swr';
import { fetcher } from '../utils/swrFetcher';


export default function CurrencyDetail() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const { register, handleSubmit, reset, formState: { errors }, } = useForm<CurrencyFormData>({ resolver: zodResolver(CurrencySchema) });

  const { data: currency, error: currencyError, mutate: currencyData } = useSWR(`/api/currencies/currencies/${code}/`, fetcher, { onSuccess: (data) => reset(data),});

  const { data: exchangeRates, error: exchangerateError, mutate: refreshRates } = useSWR(currency?.is_local === false ? `/api/currencies/exchangerates/?currency=${currency.code}` : null, fetcher );


  const onSubmit = async (data: CurrencyFormData) => {
    try {
      await axiosInstance.put(`/api/currencies/currencies/${code}/`, data);
      toast.success('Currency updated successfully');
      await currencyData(); // Refresh currency data
    } catch (error) {
      toast.error('Failed to update currency');
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/api/currencies/currencies/${code}/`, { suppressGlobalError: true,});
      toast.success('Currency deleted successfully');
      setShowModal(false); 
      navigate('/currencies');
    } catch (error: any) {
      setShowModal(false); 
      const responseData = error?.response?.data;
      if (Array.isArray(responseData)) {
        toast.error(responseData[0]);
      } 
      else if (typeof responseData === 'object' && responseData?.detail) {
        toast.error(responseData.detail);
      } 
      else {
        toast.error('Failed to delete currency');
      }
    }
  };
  
  if (currencyError) return <p className="text-red-600">Error loading currency</p>;
  if (exchangerateError) return <p className="text-red-600">Error loading exchange rates</p>;
  if (!currency) return <p>Loading...</p>;

  return (
    <div className="max-w-md p-4">
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2 className="text-xl font-bold mb-4">Currency Details</h2>
        <label className="block mb-2">
          Code:
          <input {...register('code')} className="border w-full p-1" disabled />
        </label>
        <label className="block mb-2">
          Description:
          <input {...register('description')} className="border w-full p-1" />
          {errors.description && <p className="text-red-600 text-sm">{errors.description.message}</p>}
        </label>
        <label className="block mb-2">
          Is Local:
          <input type="checkbox" {...register('is_local')} />
        </label>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 mr-2 rounded">Update</button>
      </form>
        <button type="button" onClick={() => setShowModal(true)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Delete</button>
        <ConfirmModal
        isOpen={showModal}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${code}"?`}
        onCancel={() => setShowModal(false)}
        onConfirm={handleDelete}
      />

      {!currency.is_local && exchangeRates && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Exchange Rate</h3>
                <Link to={`/currencies/${code}/exchange-rate/create`} className="bg-indigo-600 text-white px-4 py-1 rounded text-sm">Add Exchange Rate</Link>
              </div>

              {exchangeRates.length === 0 ? (
                <p className="text-gray-600">No exchange rates recorded yet.</p>
              ) : (
                <>
                  {/* Current rate display */}
                  {exchangeRates.filter((rate: ExchangeRate) => rate.is_current)
                    .map((rate: ExchangeRate) => (
                      <li key={rate.id} className="border border-green-400 p-3 rounded mb-3 bg-green-50">
                        <p><strong>Rate:</strong> {rate.rate}</p>
                        <p><strong>Created by:</strong> {rate.created_by}</p>
                        <p><strong>Created at:</strong> {new Date(rate.created_at).toLocaleString()}</p>

                        <label className="inline-flex items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            checked={rate.is_current}
                            onChange={async () => {
                              const optimisticRates = exchangeRates.map((r: ExchangeRate) =>
                                r.id === rate.id ? { ...r, is_current: !r.is_current } : r
                              );
                              await refreshRates(optimisticRates, false);

                              try {
                                await axiosInstance.patch(`/api/currencies/exchangerates/${rate.id}/`, {
                                  is_current: !rate.is_current,
                                });
                                toast.success(`Exchange rate ${!rate.is_current ? 'marked' : 'unmarked'} as current`);
                                await refreshRates();
                              } catch (error: any) {
                                const msg = error?.response?.data?.detail || 'Failed to update current status';
                                toast.error(msg);
                                await refreshRates();
                              }
                            }}
                          />
                          <span className="text-sm">Current</span>
                        </label>
                      </li>
                    ))}

                  {/* Toggle history section */}
                  <button
                    onClick={() => setShowHistory((prev) => !prev)}
                    className="text-sm text-indigo-600 hover:text-indigo-800 mt-1 mb-3 underline transition"
                  >
                    {showHistory ? 'Hide History' : 'Show History'}
                  </button>

                  {/* Collapsible history */}
                  <div className={`transition-all duration-300 ease-in-out ${showHistory ? 'max-h-screen' : 'max-h-0 overflow-hidden'}`}>
                    <ul className="space-y-2">
                      {exchangeRates
                        .filter((rate: ExchangeRate) => !rate.is_current)
                        .map((rate: ExchangeRate) => (
                          <li key={rate.id} className="border p-2 rounded bg-gray-50">
                            <p><strong>Rate:</strong> {rate.rate}</p>
                            <p><strong>Created by:</strong> {rate.created_by}</p>
                            <p><strong>Created at:</strong> {new Date(rate.created_at).toLocaleString()}</p>
                          </li>
                        ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
      )}
      <Button variant="secondary" onClick={() => navigate('/currencies')}>Back</Button>
    </div>
  );
}
