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
export const createMessageStream = async ({ chat_id, content, role }, onIdReceived, onChunk,signal) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.access_token || "";

  const response = await fetch(`${API_URL}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ chat_id, content, role }),
    signal : signal
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let isFirstChunk = true;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value);

    if (isFirstChunk && text.startsWith("MSG_ID:")) {
      const [idPart, ...rest] = text.split("\n");
      const ids = idPart.replace("MSG_ID:", "").split(",");
      onIdReceived(ids[0], ids[1]);
      if (rest.join("\n")) onChunk(rest.join("\n"));
      isFirstChunk = false;
    } else {
      onChunk(text);
    }
  }
};

export const reportAbort = async (messageId, content) => {
  try {
    await api.patch(`/messages/${messageId}/abort`, { content });
  } catch (err) {
    console.error("Failed to report abort", err);
  }
};

export const getMessages = async (chatId) => {
  try {
    const response = await api.get(`/messages/${chatId}`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};