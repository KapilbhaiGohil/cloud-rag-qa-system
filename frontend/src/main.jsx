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
      <Toaster position="top-right" />
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
);