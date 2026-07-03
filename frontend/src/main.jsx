import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, ToastBar, toast } from 'react-hot-toast';
import store from './redux';
import App from './App';
import './styles/index.css';

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000 // 5 minutes
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster 
            position="top-right" 
            toastOptions={{
              duration: 4000,
              style: {
                background: '#FFFFFF',
                color: '#0F172A',
                border: '1px solid #E2E8F0',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif'
              }
            }}
          >
            {(t) => (
              <ToastBar toast={t}>
                {({ icon, message }) => (
                  <>
                    {t.type !== 'loading' && icon ? (
                      <button
                        onClick={() => toast.dismiss(t.id)}
                        className="cursor-pointer hover:opacity-75 transition-opacity focus:outline-none flex items-center justify-center shrink-0"
                        title="Click to dismiss"
                      >
                        {icon}
                      </button>
                    ) : (
                      icon
                    )}
                    {message}
                  </>
                )}
              </ToastBar>
            )}
          </Toaster>
        </BrowserRouter>
      </QueryClientProvider>
    </ReduxProvider>
  </React.StrictMode>
);
