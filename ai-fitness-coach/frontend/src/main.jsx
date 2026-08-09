import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #E4EAF3',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: '600',
              padding: '14px 18px',
              boxShadow: '0 8px 24px rgba(15,23,42,0.10)',
            },
            success: {
              iconTheme: { primary: '#2563EB', secondary: '#ffffff' },
            },
            error: {
              iconTheme: { primary: '#f43f5e', secondary: '#ffffff' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
