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
import { useRef } from "react";
import { createMessage, getMessages } from "../services/messageService";
import { toast } from "react-hot-toast";
import { useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import SendIcon from "@mui/icons-material/Send";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useAuth } from "../context/AuthContext.jsx";
import {
  uploadDocument,
  getDocuments,
  renameDocument as renameDocumentAPI,
  deleteDocument as deleteDocumentAPI,
} from "../services/documentService";

const Dashboard = () => {
  const { user, logout } = useAuth();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatDocuments, setChatDocuments] = useState([]);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingDocId, setEditingDocId] = useState(null);
  const [chatNewName, setChatNewName] = useState("");
  const [docNewName, setDocNewName] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const chatEndRef = useRef(null);

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
    const chatList = res.data?.chats || [];
    setChats(chatList);

    // if (chatList.length > 0) {
    //   selectChat(chatList[0]._id);
    // }

  };
  const addChat = async () => {
    const res = await createChat("New Chat");

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    toast.success("Chat created");
    selectChat(res.data._id);
    setChats((prev) => [...prev, res.data]);
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

    const res = await getMessages(chatId);

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    setChatMessages(res.data.messages);
    const docsRes = await getDocuments(chatId);

    if (!docsRes.success) {
      toast.error(docsRes.message);
      return;
    }

    setChatDocuments(docsRes.data.documents);
  };
  const renameChat = async (id) => {
    const res = await renameChatAPI(id, chatNewName);

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    toast.success("Chat renamed");

    setChats((prev) =>
      prev.map((c) =>
        c._id === id ? { ...c, name: chatNewName } : c
      )
    );

    setEditingChatId(null);
    setChatNewName("");
  };
  const addDocument = async (file) => {
    if (!file) return;

    setUploading(true);
    const res = await uploadDocument(selectedChat, file);
    setUploading(false);
    if (!res.success) {
      toast.error(res.message);
      return;
    }

    setChatDocuments((prev) => [res.data, ...prev]);
  };

  const deleteDocument = async (docId) => {
    const res = await deleteDocumentAPI(docId);

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    setChatDocuments((prev) =>
      prev.filter((d) => d._id !== docId)
    );
  };

  const renameDocument = async (docId) => {
    const currentDoc = chatDocuments.find((d) => d._id === docId);

    const extension = currentDoc.name.includes(".")
      ? currentDoc.name.substring(currentDoc.name.lastIndexOf("."))
      : "";

    const finalName = docNewName.trim() + extension;

    if (!docNewName.trim() || finalName === currentDoc.name) {
      setEditingDocId(null);
      setDocNewName("");
      return;
    }

    const res = await renameDocumentAPI(docId, finalName);

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    setChatDocuments((prev) =>
      prev.map((d) =>
        d._id === docId ? { ...d, name: finalName } : d
      )
    );

    setEditingDocId(null);
    setDocNewName("");
  };
  const sendMessage = async () => {
    if (!message.trim()) return;

    const tempId = Date.now();

    const optimisticMessage = {
      _id: tempId,
      role: "user",
      content: message,
      isTemp: true,
    };

    setChatMessages((prev) => [...prev, optimisticMessage]);
    setMessage("");

    try {
      const res = await createMessage({
        chat_id: selectedChat,
        role: "user",
        content: optimisticMessage.content,
      });

      if (!res.success) throw new Error(res.message);

      const { user_message, assistant_message } = res.data;

      setChatMessages((prev) =>
        prev
          .map((msg) =>
            msg._id === tempId ? user_message : msg
          )
          .concat(assistant_message)
      );

    } catch (error) {
      setChatMessages((prev) =>
        prev.filter((msg) => msg._id !== tempId)
      );

      toast.error(error.message || "Failed to send message");
    }
  };
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);
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
                  value={chatNewName}
                  onChange={(e) => setChatNewName(e.target.value)}
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
                      setChatNewName(chat.name);
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
          sx={{
            color: "#fff",
            bgcolor: "#dc2626",
            mt: 1,
            "&:hover": { bgcolor: "#b91c1c" },
          }}
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
                    {msg.content}
                  </Paper>
                </Box>
              ))}
              <div ref={chatEndRef} />
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendMessage();
                  }
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
            disabled={uploading}
            sx={{ mb: 2 }}
          >
            {uploading ? "Uploading..." : "Upload"}
            <input
              hidden
              type="file"
              onChange={(e) => {
                addDocument(e.target.files[0]);
                e.target.value = null;
              }}
            />
          </Button>

          <List>
            {chatDocuments.map((doc) => (
              <Paper
                key={doc._id}
                sx={{
                  p: 1,
                  mb: 1,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {editingDocId === doc._id ? (
                  <TextField
                    size="small"
                    value={docNewName}
                    onChange={(e) => setDocNewName(e.target.value)}
                    onBlur={() => renameDocument(doc._id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        renameDocument(doc._id);
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 145,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {doc.name}
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingDocId(doc._id);
                          const nameWithoutExt = doc.name.includes(".")
                            ? doc.name.substring(0, doc.name.lastIndexOf("."))
                            : doc.name;

                          setDocNewName(nameWithoutExt);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => deleteDocument(doc._id)}
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