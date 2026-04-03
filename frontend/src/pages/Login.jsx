import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Stack
} from '@mui/material';
import { loginUser } from '../services/authService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await loginUser(username, password);
      login(userData);
      setError('');
      navigate('/dashboard'); // redirect after login
    } catch (err) {
      setError('Invalid username or password');
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
          Login
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
            sx={{ mb: 1 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Forgot Password */}
          <Box sx={{ textAlign: 'right', mb: 2 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'text.disabled',
                cursor: 'not-allowed'
              }}
            >
              Forgot Password (Coming Soon)
            </Typography>
          </Box>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Button type="submit" variant="contained" fullWidth sx={{ mb: 2 }}>
            Login
          </Button>
        </form>

        {/* Signup */}
        <Stack direction="row" justifyContent="center">
          <Typography variant="body2">
            Don't have an account?
          </Typography>
          <Link
            component="button"
            variant="body2"
            sx={{ ml: 1 }}
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </Link>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Login;