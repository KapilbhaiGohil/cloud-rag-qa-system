import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme/theme.js';
import { Toaster } from "react-hot-toast";
import "highlight.js/styles/github.css";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#1f1f1f',
            fontFamily: "'Google Sans', 'Inter', 'Roboto', sans-serif",
            borderRadius: '16px',
            border: '1px solid #e3e3e3',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            padding: '12px 24px',
            fontSize: '0.95rem',
            fontWeight: 500,
          },
          success: {
            iconTheme: {
              primary: '#1a73e8', 
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#d32f2f',
              secondary: '#ffffff',
            },
            style: {
              background: '#fef7f6',
              borderColor: '#f4cccc',
            }
          },
        }}
      />
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
);