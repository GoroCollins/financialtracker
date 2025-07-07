import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { ExchangeRateSchema, ExchangeRateFormData } from '../utils/zodSchemas';
import { axiosInstance } from '../authentication/AuthenticationService';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function CreateExchangeRate() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ExchangeRateFormData>({
    resolver: zodResolver(ExchangeRateSchema),
    // defaultValues: {
    //   is_current: true, // Default assumption
    // },
  });

  const onSubmit = async (data: ExchangeRateFormData) => {
    try {
      await axiosInstance.post('/api/currencies/exchangerates/', {
        ...data,
        currency: code,
      });
      toast.success('Exchange rate saved!');
      reset();
      navigate(`/currencies/${code}`);
    } catch (error: any) {
      if (error.response?.data) {
        const messages = Object.values(error.response.data).flat();
        const joined = messages.join(' ');
        setErrorMessage(joined);
        toast.error(joined);
      } else {
        setErrorMessage('An unexpected error occurred.');
        toast.error('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Create Exchange Rate for {code}</h2>
      {errorMessage && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{errorMessage}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Rate:</label>
          <input
            type="number"
            step="0.01"
            {...register('rate', { valueAsNumber: true })}
            className="border w-full p-2 rounded"
          />
          {errors.rate && <p className="text-red-600 text-sm mt-1">{errors.rate.message}</p>}
        </div>

        <div>
          <label className="block mb-1 font-medium">Is Current?</label>
          <input type="checkbox" {...register('is_current')} />
          {errors.is_current && <p className="text-red-600 text-sm mt-1">{errors.is_current.message}</p>}
        </div>

        <div className="flex gap-2">
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Save
          </button>
          <button
            type="button"
            onClick={() => navigate(`/currencies/${code}`)}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
