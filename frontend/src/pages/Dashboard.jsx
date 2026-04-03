import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext.jsx';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Dashboard
      </Typography>

      <Typography sx={{ mb: 2 }}>
        Welcome, {user?.username}
      </Typography>

      <Button variant="contained" color="secondary" onClick={logout}>
        Logout
      </Button>
    </Box>
  );
};

export default Dashboard;