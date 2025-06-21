import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { CurrencySchema, CurrencyFormData } from '../utils/zodSchemas';
import { axiosInstance } from '../authentication/AuthenticationService';

export default function CurrencyDetail() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CurrencyFormData>({ resolver: zodResolver(CurrencySchema) });

  useEffect(() => {
    axiosInstance.get(`/api/currencies/currencies/${code}/`).then((res) => reset(res.data));
  }, [code, reset]);

  const onSubmit = async (data: CurrencyFormData) => {
    await axiosInstance.put(`/api/currencies/currencies/${code}/`, data);
    navigate('/currencies');
  };

  const handleDelete = async () => {
    await axiosInstance.delete(`/api/currencies/currencies/${code}/`);
    navigate('/currencies');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md p-4">
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
  );
}