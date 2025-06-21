import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { CurrencySchema, CurrencyFormData } from '../utils/zodSchemas';
import { axiosInstance } from '../authentication/AuthenticationService';

export default function CreateCurrency() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CurrencyFormData>({ resolver: zodResolver(CurrencySchema) });

  const onSubmit = async (data: CurrencyFormData) => {
    try {
      await axiosInstance.post('/api/currencies/currencies/', data);
      navigate('/currencies');
    } catch (error: any) {
      if (error.response?.data) {
        const messages = Object.values(error.response.data).flat();
        setErrorMessage(messages.join(' '));
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md p-4">
      <h2 className="text-xl font-bold mb-4">Create Currency</h2>
      {errorMessage && <div className="bg-red-100 text-red-700 p-2 rounded mb-4">{errorMessage}</div>}
      <label className="block mb-2">
        Code:
        <input {...register('code')} className="border w-full p-1" />
        {errors.code && <p className="text-red-600 text-sm">{errors.code.message}</p>}
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
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Create</button>
    </form>
  );
}