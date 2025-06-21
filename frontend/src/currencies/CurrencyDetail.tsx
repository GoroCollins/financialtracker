import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { CurrencySchema, CurrencyFormData } from '../utils/zodSchemas';
import { axiosInstance } from '../authentication/AuthenticationService';
import { toast } from 'react-hot-toast'; // ✅ toast import

interface ExchangeRate {
  id: number;
  rate: string;
  created_by: string;
  created_at: string;
}

export default function CurrencyDetail() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [isLocal, setIsLocal] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CurrencyFormData>({ resolver: zodResolver(CurrencySchema) });

  useEffect(() => {
    axiosInstance.get(`/api/currencies/currencies/${code}/`).then((res) => {
      setIsLocal(res.data.is_local);
      reset(res.data);

      if (!res.data.is_local) {
        axiosInstance.get(`/api/currencies/exchangerates/?currency=${res.data.code}`).then((res) => {
          setExchangeRates(res.data);
        });
      }
    });
  }, [code, reset]);

  const onSubmit = async (data: CurrencyFormData) => {
    try {
      await axiosInstance.put(`/api/currencies/currencies/${code}/`, data);
      toast.success('Currency updated successfully');
      navigate('/currencies');
    } catch (error) {
      toast.error('Failed to update currency');
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this currency?');
    if (!confirmed) return;

    try {
      await axiosInstance.delete(`/api/currencies/currencies/${code}/`);
      toast.success('Currency deleted successfully');
      navigate('/currencies');
    } catch (error) {
      toast.error('Failed to delete currency');
    }
  };

  return (
    <div className="max-w-md p-4">
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2 className="text-xl font-bold mb-4">Edit Currency</h2>
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
        <button type="button" onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">Delete</button>
      </form>

      {!isLocal && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Exchange Rate History</h3>
            <Link
              to={`/currencies/${code}/exchange-rate/create`}
              className="bg-indigo-600 text-white px-4 py-1 rounded text-sm"
            >
              Add Exchange Rate
            </Link>
          </div>
          {exchangeRates.length === 0 ? (
            <p className="text-gray-600">No exchange rates recorded yet.</p>
          ) : (
            <ul className="space-y-2">
              {exchangeRates.map((rate) => (
                <li key={rate.id} className="border p-2 rounded">
                  <p><strong>Rate:</strong> {rate.rate}</p>
                  <p><strong>Created by:</strong> {rate.created_by}</p>
                  <p><strong>Created at:</strong> {new Date(rate.created_at).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
