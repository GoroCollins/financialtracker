import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { axiosInstance } from '../services/apiClient';
import { AxiosError } from 'axios';

const ConfirmEmail: React.FC = () => {
  const { key } = useParams<{ key: string }>();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true; // prevent state updates after unmount

    const verifyEmail = async () => {
      if (!key) {
        // Schedule state update after effect runs
        setTimeout(() => {
          if (isMounted) {
            setStatus('error');
            setMessage('Invalid confirmation link.');
          }
        }, 0);
        return;
      }

      try {
        await axiosInstance.post('dj-rest-auth/registration/verify-email/', { key });

        if (isMounted) {
          setStatus('success');
          setMessage('Email confirmed successfully! Redirecting to login...');
          setTimeout(() => navigate('/login'), 2000);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setStatus('error');
          const error = err as AxiosError<{ old_password?: string[]; detail?: string }>
          const detail =
            error?.response?.data?.detail ||
            'Email confirmation failed. This link may have expired or is invalid.';
          setMessage(detail);
        }
      }
    };

    verifyEmail();

    return () => {
      isMounted = false; // cleanup
    };
  }, [key, navigate]); // include navigate as dependency

  return (
    <div className="container mt-5">
      <div className="card p-4">
        <h3 className="mb-3">
          {status === 'pending' && 'Verifying Email...'}
          {status === 'success' && 'Success 🎉'}
          {status === 'error' && 'Error ❌'}
        </h3>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default ConfirmEmail;
