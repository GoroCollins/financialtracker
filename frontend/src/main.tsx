// import "tailwindcss";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ErrorInfo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorPage from './GlobalErrorHandler.tsx';
import "react-datepicker/dist/react-datepicker.css";

// Custom error handler function to log error
const errorHandler = (error: Error, info: ErrorInfo) => {
  console.error('Error caught by ErrorBoundary:', error);
  console.error('Component Stack:', info.componentStack || 'No component stack available');
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorPage} // Use the ErrorPage as the fallback UI
    onError={errorHandler} // Optional error logging
    onReset={() => (location.href = '/')} // Reset logic to reload the app
    >
    <App />
    </ErrorBoundary>
  </StrictMode>,
)
