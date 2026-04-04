import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  TextField,
  Divider,
  Paper,
} from "@mui/material";
import {
  createChat,
  getChats,
  renameChat as renameChatAPI,
  deleteChat as deleteChatAPI,
} from "../services/chatService.js";
import { toast } from "react-hot-toast";
import { useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import SendIcon from "@mui/icons-material/Send";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useAuth } from "../context/AuthContext.jsx";

const Dashboard = () => {
  const { user, logout } = useAuth();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatDocuments, setChatDocuments] = useState([]);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingDocId, setEditingDocId] = useState(null);
  const [newName, setNewName] = useState("");
  const [message, setMessage] = useState("");


  const currentChat = chats.find((c) => c._id === selectedChat);
  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    const res = await getChats();

    if (!res.success) {
      toast.error(res.message);
      return;
    }
    setChats(res.data?.chats || []);
  };
  const addChat = async () => {
    const res = await createChat("New Chat");

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    toast.success("Chat created");

    setChats((prev) => [res.data, ...prev]);
  };
  const deleteChat = async (id) => {
    const res = await deleteChatAPI(id);

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    toast.success("Chat deleted");

    setChats((prev) => prev.filter((c) => c._id !== id));

    if (selectedChat === id) setSelectedChat(null);
  };
  const selectChat = async (chatId) => {
    setSelectedChat(chatId);
    setChatMessages([]);
    setChatDocuments([]);

    // Dummy messages for now
    const dummyMessages = [
      { role: "assistant", text: "Hello! This is a dummy message." },
      { role: "user", text: "Hi there!" },
    ];
    setChatMessages(dummyMessages);

    // Dummy documents for now
    const dummyDocuments = [
      { id: 1, name: "Example.pdf" },
      { id: 2, name: "Notes.docx" },
    ];
    setChatDocuments(dummyDocuments);

    // In future, fetch real messages & documents:
    // const res = await getChatMessages(chatId);
    // if(res.success) setChatMessages(res.data.messages);
    // const docsRes = await getChatDocuments(chatId);
    // if(docsRes.success) setChatDocuments(docsRes.data.documents);
  };
  const renameChat = async (id) => {
    const res = await renameChatAPI(id, newName);

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    toast.success("Chat renamed");

    setChats((prev) =>
      prev.map((c) =>
        c._id === id ? { ...c, name: newName } : c
      )
    );

    setEditingChatId(null);
    setNewName("");
  };
  const addDocument = (file) => {
    setChatDocuments((prev) => [...prev, { id: Date.now(), name: file.name }]);
  };

  const deleteDocument = (docId) => {
    setChatDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  const renameDocument = (docId) => {
    setChatDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, name: newName } : d))
    );
    setEditingDocId(null);
    setNewName("");
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    setChatMessages((prev) => [...prev, { role: "user", text: message }]);
    setMessage("");
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f9fafb" }}>

      {/* LEFT SIDEBAR */}
      <Box
        sx={{
          width: 260,
          p: 2,
          bgcolor: "#111827",
          color: "white",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Button
          fullWidth
          startIcon={<AddIcon />}
          onClick={addChat}
          sx={{
            mb: 2,
            bgcolor: "#2563eb",
            color: "#fff",
            "&:hover": { bgcolor: "#1d4ed8" },
          }}
        >
          New Chat
        </Button>

        <List sx={{ flexGrow: 1 }}>
          {chats.map((chat) => (
            <ListItemButton
              key={chat._id}
              selected={selectedChat === chat._id}
              onClick={() => selectChat(chat._id)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                "&.Mui-selected": {
                  bgcolor: "#1e40af",
                },
                "&:hover": {
                  bgcolor: "#374151",
                },
              }}
            >
              {editingChatId === chat._id ? (
                <TextField
                  size="small"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={() => renameChat(chat._id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      renameChat(chat._id);
                    }
                  }}
                  autoFocus
                  fullWidth
                  sx={{
                    input: { color: "#fff" }, // text color inside input
                  }}
                />
              ) : (
                <>
                  <ListItemText primary={chat.name} />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingChatId(chat._id);
                      setNewName(chat.name);
                    }}
                  >
                    <EditIcon fontSize="small" sx={{ color: "#ccc" }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat._id);
                    }}
                  >
                    <DeleteIcon fontSize="small" sx={{ color: "#ccc" }} />
                  </IconButton>
                </>
              )}
            </ListItemButton>
          ))}
        </List>

        <Divider sx={{ my: 2, bgcolor: "#374151" }} />

        <Typography variant="body2">{user?.username}</Typography>
        <Button
          startIcon={<LogoutIcon />}
          onClick={logout}
          sx={{ color: "#ccc" }}
        >
          Logout
        </Button>
      </Box>

      {/* CHAT AREA */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {currentChat ? (
          <>
            <Box
              sx={{
                flexGrow: 1,
                p: 3,
                overflowY: "auto",
              }}
            >
              {chatMessages.map((msg, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                    mb: 2,
                  }}
                >
                  <Paper
                    sx={{
                      p: 1.5,
                      maxWidth: "60%",
                      borderRadius: 3,
                      bgcolor: msg.role === "user" ? "#2563eb" : "#e5e7eb",
                      color: msg.role === "user" ? "#fff" : "#111",
                    }}
                  >
                    {msg.text}
                  </Paper>
                </Box>
              ))}
            </Box>

            {/* INPUT */}
            <Box
              sx={{
                p: 2,
                borderTop: "1px solid #ddd",
                display: "flex",
                gap: 1,
                bgcolor: "#fff",
              }}
            >
              <TextField
                fullWidth
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                sx={{
                  bgcolor: "#f3f4f6",
                  borderRadius: 2,
                }}
              />
              <IconButton
                onClick={sendMessage}
                sx={{
                  bgcolor: "#2563eb",
                  color: "#fff",
                  "&:hover": { bgcolor: "#1d4ed8" },
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </>
        ) : (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" color="text.secondary">
              Select a chat
            </Typography>
          </Box>
        )}
      </Box>

      {/* DOCUMENT PANEL */}
      {currentChat && (
        <Box
          sx={{
            width: 260,
            p: 2,
            bgcolor: "#f3f4f6",
            borderLeft: "1px solid #ddd",
          }}
        >
          <Button
            fullWidth
            startIcon={<UploadFileIcon />}
            component="label"
            sx={{ mb: 2 }}
          >
            Upload
            <input
              hidden
              type="file"
              onChange={(e) => addDocument(e.target.files[0])}
            />
          </Button>

          <List>
            {chatDocuments.map((doc) => (
              <Paper
                key={doc.id}
                sx={{
                  p: 1,
                  mb: 1,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {editingDocId === doc.id ? (
                  <TextField
                    size="small"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onBlur={() => renameDocument(doc.id)}
                    autoFocus
                  />
                ) : (
                  <>
                    <Typography variant="body2">{doc.name}</Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingDocId(doc.id);
                          setNewName(doc.name);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => deleteDocument(doc.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </>
                )}
              </Paper>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default Dashboard;