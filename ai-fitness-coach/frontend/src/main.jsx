import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#16181C',
                color: '#FEF9F5',
                border: '1px solid rgba(184,253,2,0.3)',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: '600',
                padding: '14px 18px',
                boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
              },
              success: {
                iconTheme: { primary: '#B8FD02', secondary: '#0B0C0E' },
              },
              error: {
                iconTheme: { primary: '#f43f5e', secondary: '#ffffff' },
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
