import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import './i18n';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import ToastWrapper from './components/common/ToastWrapper';

// Get initial language for ToastContainer
const initialLanguage = localStorage.getItem('language') || 'en';
const isRTL = initialLanguage === 'ar';

// Enable debug mode
if (process.env.NODE_ENV === 'development') {
  // Log all component renders in development
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Filter out known React warnings that are not critical
    const message = args[0];
    if (
      typeof message === 'string' &&
      (message.includes('Warning:') || message.includes('ReactDOM'))
    ) {
      // Still log but don't spam
      originalConsoleError(...args);
    } else {
      originalConsoleError(...args);
    }
  };

  // Add global error handler
  window.addEventListener('error', (event) => {
    console.group('🔴 Global Error Handler');
    console.error('Error:', event.error);
    console.error('Message:', event.message);
    console.error('Filename:', event.filename);
    console.error('Line:', event.lineno);
    console.error('Column:', event.colno);
    console.error('Stack:', event.error?.stack);
    console.groupEnd();
  });

  // Add unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    console.group('🔴 Unhandled Promise Rejection');
    console.error('Reason:', event.reason);
    console.error('Promise:', event.promise);
    console.groupEnd();
  });

  console.log('🐛 Debug mode enabled');
  console.log('React version:', React.version);
  console.log('Environment:', process.env.NODE_ENV);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <App />
              <ToastWrapper isRTL={isRTL} />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
