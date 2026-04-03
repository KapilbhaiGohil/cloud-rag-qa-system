import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#f50057' },
    background: { default: '#f5f5f5' },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h5: { fontWeight: 600 },
  },
});

export default theme;