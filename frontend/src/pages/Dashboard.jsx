import React, { useState, useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { toast } from "react-hot-toast";

import { useAuth } from "../context/AuthContext.jsx";
import {
  createChat,
  getChats,
  renameChat as renameChatAPI,
  deleteChat as deleteChatAPI,
} from "../services/chatService.js";
import { createMessage, getMessages } from "../services/messageService";
import {
  uploadDocument,
  getDocuments,
  renameDocument as renameDocumentAPI,
  deleteDocument as deleteDocumentAPI,
} from "../services/documentService";

import ChatSidebar from "../components/ChatSidebar";
import ChatArea from "../components/ChatArea";
import DocumentSidebar from "../components/DocumentSidebar";

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
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef(null);

  const currentChat = chats.find((c) => c._id === selectedChat);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const fetchChats = async () => {
    const res = await getChats();
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    const chatList = res.data?.chats || [];
    setChats(chatList);
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
      prev.map((c) => (c._id === id ? { ...c, name: chatNewName } : c))
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
    setChatDocuments((prev) => prev.filter((d) => d._id !== docId));
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
      prev.map((d) => (d._id === docId ? { ...d, name: finalName } : d))
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
      created_at: new Date(),
      isTemp: true,
    };

    setChatMessages((prev) => [...prev, optimisticMessage]);
    setMessage("");
    setIsTyping(true);

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
          .map((msg) => (msg._id === tempId ? user_message : msg))
          .concat(assistant_message)
      );
    } catch (error) {
      setChatMessages((prev) => prev.filter((msg) => msg._id !== tempId));
      toast.error(error.message || "Failed to send message");
    }finally{
      setIsTyping(false);
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#ffffff", color: "#1f1f1f", fontFamily: "'Google Sans', 'Inter', 'Roboto', sans-serif" }}>
      
      {/* LEFT SIDEBAR */}
      <ChatSidebar
        user={user}
        logout={logout}
        chats={chats}
        selectedChat={selectedChat}
        addChat={addChat}
        selectChat={selectChat}
        deleteChat={deleteChat}
        renameChat={renameChat}
        editingChatId={editingChatId}
        setEditingChatId={setEditingChatId}
        chatNewName={chatNewName}
        setChatNewName={setChatNewName}
      />

      {/* CHAT AREA */}
      <ChatArea
        currentChat={currentChat}
        chatMessages={chatMessages}
        message={message}
        setMessage={setMessage}
        sendMessage={sendMessage}
        chatEndRef={chatEndRef}
        isTyping={isTyping}
      />

      {/* DOCUMENT PANEL */}
      <DocumentSidebar
        currentChat={currentChat}
        uploading={uploading}
        addDocument={addDocument}
        chatDocuments={chatDocuments}
        deleteDocument={deleteDocument}
        renameDocument={renameDocument}
        editingDocId={editingDocId}
        setEditingDocId={setEditingDocId}
        docNewName={docNewName}
        setDocNewName={setDocNewName}
      />
      
    </Box>
  );
};

export default Dashboard;