import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  CircularProgress,
} from "@mui/material";
import { registerUser } from "../services/authService.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    setFieldErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const errors = {};

    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (form.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setLoading(false);
      return;
    }

    const res = await registerUser(form.username, form.password);

    if (!res.success) {
      toast.error(res.message);

      if (res.errors) {
        setFieldErrors(res.errors);
      }

      setLoading(false);
      return;
    }

    toast.success("Account created successfully 🎉");

    setTimeout(() => {
      navigate("/login");
    }, 1200);

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
          Sign Up
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
            sx={{ mb: 2 }}
            value={form.password}
            onChange={handleChange}
            error={!!fieldErrors.password}
            helperText={fieldErrors.password}
          />

          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
            required
            sx={{ mb: 2 }}
            value={form.confirmPassword}
            onChange={handleChange}
            error={!!fieldErrors.confirmPassword}
            helperText={fieldErrors.confirmPassword}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Sign Up"}
          </Button>
        </form>

        <Typography variant="body2" align="center">
          Already have an account?{" "}
          <Link component="button" onClick={() => navigate("/login")}>
            Login
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Signup;