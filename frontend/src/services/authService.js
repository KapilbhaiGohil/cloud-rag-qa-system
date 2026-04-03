import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const handleError = (error) => {
  if (error.response) {
    const data = error.response.data;

    return {
      success: false,
      message: data?.message || "Something went wrong",
      errors: data?.errors || {},
      status: error.response.status,
    };
  }

  return {
    success: false,
    message: "Network error. Please try again.",
    errors: {},
  };
};

export const loginUser = async (username, password) => {
  try {
    const response = await api.post("/auth/login", { username, password });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const registerUser = async (username, password) => {
  try {
    const response = await api.post("/auth/register", {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};