import React from 'react';
import NotFoundImage from "./assets/notfound.png";
import "./ErrorPage.css";

interface ErrorPageProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ error, resetErrorBoundary }) => {
  console.log('An Error occurred:', error);

  return (
    // <div className='error-page'>
    //   <img src={NotFoundImage} alt='Page not found' />
    //   <p className='error-msg'>
    //     Something went wrong. Try clicking the refresh page button to reload the application.{' '}
    //     <button className='btn' onClick={resetErrorBoundary}>
    //       Refresh page
    //     </button>
    //   </p>
    // </div>
    <div className="error-page flex flex-col items-center justify-center min-h-screen p-6 text-center">
  <img
    src={NotFoundImage}
    alt="Oops! Something went wrong"
    className="max-w-sm mb-6"
  />
  <h1 className="text-2xl font-semibold mb-2">Oops! Something went wrong</h1>
  <p className="text-gray-600 mb-4">
    We couldn’t load your dashboard. Try refreshing the page or come back later.
  </p>
  <button
    className="btn btn-primary px-6 py-2 rounded-lg shadow hover:shadow-md transition"
    onClick={resetErrorBoundary}
  >
    Refresh Page
  </button>
  {/* Optional debug info */}
  <pre className="mt-4 text-sm text-red-500 hidden md:block">{error.message}</pre>
</div>

  );
};

export default ErrorPage;
