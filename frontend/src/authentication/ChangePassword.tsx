import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { changePassword } from './ChangePasswordUtility';
import useSWR from 'swr';
import { axiosInstance } from './AuthenticationService';
import { useNavigate } from 'react-router-dom';

type FormInputs = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

// const fetchUser = async () => {
//   const res = await axiosInstance.get('/dj-rest-auth/user/');
//   return res.data;
// };

const ChangePassword: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormInputs>();

  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
//   const { mutate } = useSWR('/dj-rest-auth/user/', fetchUser);
  const navigate = useNavigate();
  const newPassword = watch('newPassword');

  const onSubmit = async (data: FormInputs) => {
    setApiError(null);
    setSuccess(false);

    try {
      await changePassword(data.oldPassword, data.newPassword);
      setSuccess(true);
      reset();
    //   mutate();

      // Delay, then logout
      setTimeout(() => {
        navigate('/logout');
      }, 3000); // 3 seconds delay

    } catch (err: any) {
        const serverError = err?.response?.data;

        if (serverError?.old_password?.length) {
            setApiError(serverError.old_password[0]);
        } else if (serverError?.detail) {
            setApiError(serverError.detail);
        } else if (err?.message === 'Network Error') {
            setApiError('Network error: Please check your internet connection.');
        } else {
            setApiError('An unexpected error occurred. Please try again.');
        }
    }
  };

  return (
    <div className="container mt-4">
      <h3>Change Password</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-3">
        <div className="mb-3">
          <label htmlFor="oldPassword" className="form-label">Current Password</label>
          <input
            id="oldPassword"
            type="password"
            className={`form-control ${errors.oldPassword ? 'is-invalid' : ''}`}
            {...register('oldPassword', { required: 'Current password is required' })}
          />
          {errors.oldPassword && (
            <div className="invalid-feedback">{errors.oldPassword.message}</div>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="newPassword" className="form-label">New Password</label>
          <input
            id="newPassword"
            type="password"
            className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
            {...register('newPassword', {
              required: 'New password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' },
            })}
          />
          {errors.newPassword && (
            <div className="invalid-feedback">{errors.newPassword.message}</div>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
          <input
            id="confirmPassword"
            type="password"
            className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: value =>
                value === newPassword || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && (
            <div className="invalid-feedback">{errors.confirmPassword.message}</div>
          )}
          {watch('confirmPassword') && watch('newPassword') !== watch('confirmPassword') && (
            <div className="text-danger mt-1">Passwords do not match</div>
          )}
        </div>

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Changing...' : 'Change Password'}
        </button>
      </form>

      {apiError && (
  <div className="alert alert-danger mt-3" role="alert">
    <p className="mb-2">{apiError}</p>
    <button
      className="btn btn-sm btn-outline-danger"
      onClick={() => {
        setApiError(null);
        reset(); // Reset form fields
      }}
    >
      OK
    </button>
  </div>
)}

      {success && (
        <div className="alert alert-success mt-3" role="alert">
          Password changed successfully. Redirecting to logout...
        </div>
      )}
    </div>
  );
};

export default ChangePassword;
