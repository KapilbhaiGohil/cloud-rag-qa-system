import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link
} from '@mui/material';
import { registerUser } from '../services/authService.js';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validate = () => {
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await registerUser(username, password);
      setError('');
      setSuccess('Account created successfully! Redirecting...');
      
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (err) {
      setError(err?.response?.data?.detail || 'Signup failed');
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'background.default',
      }}
    >
      <Paper sx={{ padding: 4, width: 320 }}>
        <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
          Sign Up
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            fullWidth
            required
            sx={{ mb: 2 }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            required
            sx={{ mb: 2 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            required
            sx={{ mb: 2 }}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {success && (
            <Typography color="primary" sx={{ mb: 2 }}>
              {success}
            </Typography>
          )}

          <Button type="submit" variant="contained" fullWidth sx={{ mb: 2 }}>
            Sign Up
          </Button>
        </form>

        <Typography variant="body2" align="center">
          Already have an account?{' '}
          <Link component="button" onClick={() => navigate('/login')}>
            Login
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Signup;