import React, { useState } from "react";
import { useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Stack,
  CircularProgress,
} from "@mui/material";
import { loginUser } from "../services/authService.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const Login = () => {
  const { login } = useAuth();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    setFieldErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };
   useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    const res = await loginUser(form.username, form.password);

    if (!res.success) {
      toast.error(res.message);

      if (res.errors) {
        setFieldErrors(res.errors);
      }

      setLoading(false);
      return;
    }

    // toast.success("Logged in successfully");

    login(res.data);
    navigate("/dashboard");
    setLoading(false);
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "background.default",
      }}
    >
      <Paper sx={{ padding: 4, width: 320 }}>
        <Typography variant="h5" sx={{ mb: 3, textAlign: "center" }}>
          Login
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            name="username"
            fullWidth
            required
            sx={{ mb: 2 }}
            value={form.username}
            onChange={handleChange}
            error={!!fieldErrors.username}
            helperText={fieldErrors.username}
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            required
            sx={{ mb: 1 }}
            value={form.password}
            onChange={handleChange}
            error={!!fieldErrors.password}
            helperText={fieldErrors.password}
          />

          <Box sx={{ textAlign: "right", mb: 2 }}>
            <Typography
              variant="body2"
              sx={{
                color: "text.disabled",
                cursor: "not-allowed",
              }}
            >
              Forgot Password (Coming Soon)
            </Typography>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Login"}
          </Button>
        </form>

        <Stack direction="row" justifyContent="center">
          <Typography variant="body2">
            Don't have an account?
          </Typography>
          <Link
            component="button"
            variant="body2"
            sx={{ ml: 1 }}
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </Link>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Login;