import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePassword } from './ChangePasswordUtility';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { ChangePasswordSchema, FormInputs } from '../utils/zodSchemas';

const ChangePassword: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormInputs>({
    resolver: zodResolver(ChangePasswordSchema),
  });

  const navigate = useNavigate();

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const toggleOld = () => setShowOld(prev => !prev);
  const toggleNew = () => setShowNew(prev => !prev);
  const toggleConfirm = () => setShowConfirm(prev => !prev);

  const onSubmit = async (data: FormInputs) => {
    try {
      await changePassword(data.oldPassword, data.newPassword);
      toast.success('Password changed successfully. Redirecting to logout...');
      reset();

      setTimeout(() => {
        navigate('/logout');
      }, 3000);
    } catch (err: any) {
      const serverError = err?.response?.data;

      if (serverError?.old_password?.length) {
        toast.error(serverError.old_password[0]);
      } else if (serverError?.detail) {
        toast.error(serverError.detail);
      } else if (err?.message === 'Network Error') {
        toast.error('Network error: Please check your internet connection.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  const renderPasswordField = (
    id: keyof FormInputs,
    label: string,
    show: boolean,
    toggle: () => void,
    error?: string
  ) => (
    <div className="mb-3 position-relative">
      <label htmlFor={id} className="form-label">{label}</label>
      <div className="input-group">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          className={`form-control ${error ? 'is-invalid' : ''}`}
          {...register(id)}
        />
        <span className="input-group-text" onClick={toggle} style={{ cursor: 'pointer' }}>
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </span>
        {error && <div className="invalid-feedback d-block ms-1">{error}</div>}
      </div>
    </div>
  );

  return (
    <div className="container mt-4">
      <h3>Change Password</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-3">
        {renderPasswordField('oldPassword', 'Current Password', showOld, toggleOld, errors.oldPassword?.message)}
        {renderPasswordField('newPassword', 'New Password', showNew, toggleNew, errors.newPassword?.message)}
        {renderPasswordField('confirmPassword', 'Confirm New Password', showConfirm, toggleConfirm, errors.confirmPassword?.message)}

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
