import React from 'react';
import NotFoundImage from "./assets/notfound.svg";
import "./ErrorPage.css";

interface ErrorPageProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ error, resetErrorBoundary }) => {
  console.log('An Error occurred:', error);

  return (
    <div className='error-page'>
      <img src={NotFoundImage} alt='Page not found' />
      <p className='error-msg'>
        Something went wrong. Try clicking the refresh page button to reload the application.{' '}
        <button className='btn' onClick={resetErrorBoundary}>
          Refresh page
        </button>
      </p>
    </div>
  );
};

export default ErrorPage;
