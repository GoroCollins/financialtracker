import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { axiosInstance } from './AuthenticationService';

const ConfirmEmail: React.FC = () => {
  const { key } = useParams<{ key: string }>();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!key) {
      setStatus('error');
      setMessage('Invalid confirmation link.');
      return;
    }

    axiosInstance
      .post('dj-rest-auth/registration/verify-email/', { key })
      .then(() => {
        setStatus('success');
        setMessage('Email confirmed successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login'); // redirect after 2 seconds
        }, 2000);
      })
      .catch((error) => {
        setStatus('error');
        const detail =
          error.response?.data?.detail ||
          'Email confirmation failed. This link may have expired or is invalid.';
        setMessage(detail);
      });
  }, [key]);

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
