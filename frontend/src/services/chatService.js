import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user?.access_token) {
    config.headers.Authorization = `Bearer ${user.access_token}`;
  }

  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
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

export const createChat = async (name) => {
  try {
    const response = await api.post("/chats", { name });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getChats = async () => {
  try {
    const response = await api.get("/chats");
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const renameChat = async (chatId, name) => {
  try {
    const response = await api.put(`/chats/${chatId}`, { name });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const deleteChat = async (chatId) => {
  try {
    const response = await api.delete(`/chats/${chatId}`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};
