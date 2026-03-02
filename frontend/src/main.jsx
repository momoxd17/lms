import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import api from './api/axios';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60 * 1000 } } });

async function loadTheme() {
  try {
    const { data } = await api.get('/admin/settings/public', { withCredentials: false });
    const settings = data?.settings;
    if (!settings) return;
    const root = document.documentElement;
    root.style.setProperty('--color-primary', settings.primaryColor || '#4f46e5');
    root.style.setProperty('--color-secondary', settings.secondaryColor || '#0f172a');
    root.style.setProperty('--color-background', settings.backgroundColor || '#ffffff');
    root.style.setProperty('--color-text', settings.textColor || '#0f172a');
  } catch (e) {
    // ignore theme load errors
  }
}

loadTheme();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
