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
import { createMessageStream, getMessages, reportAbort } from "../services/messageService";
import {
  uploadDocument,
  getDocuments,
  renameDocument as renameDocumentAPI,
  deleteDocument as deleteDocumentAPI,
} from "../services/documentService";
import ChatSidebar from "../components/ChatSidebar";
import ChatArea from "../components/ChatArea";
import DocumentSidebar from "../components/DocumentSidebar";
import ConfirmDialog from "../components/ConfirmDialog";

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
  const [chatToDelete, setChatToDelete] = useState(null);
  const [docToDelete, setDocToDelete] = useState(null);
  const [isFetchingChats, setIsFetchingChats] = useState(true);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isFetchingChatData, setIsFetchingChatData] = useState(false);
  const abortControllerRef = useRef(null);
  const currentMsgIdRef = useRef(null);
  const chatEndRef = useRef(null);

  const currentChat = chats.find((c) => c._id === selectedChat);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    const hasProcessingDocs = chatDocuments.some((doc) => doc.status === "processing");

    if (!hasProcessingDocs || !selectedChat) return;

    const intervalId = setInterval(async () => {
      try {
        const docsRes = await getDocuments(selectedChat);
        if (docsRes.success) {
          setChatDocuments(docsRes.data.documents);
        }
      } catch (error) {
        console.error("Failed to poll documents:", error);
      }
    }, 3000);
    return () => clearInterval(intervalId);
  }, [chatDocuments, selectedChat]);


  const fetchChats = async () => {
    setIsFetchingChats(true);
    const res = await getChats();
    setIsFetchingChats(false);

    if (!res.success) {
      toast.error(res.message);
      return;
    }
    const chatList = res.data?.chats || [];
    setChats(chatList);
  };

  const addChat = async () => {
    setIsCreatingChat(true);
    const res = await createChat("New Chat");
    setIsCreatingChat(false);

    if (!res.success) {
      toast.error(res.message);
      return;
    }
    // toast.success("Chat created");
    selectChat(res.data._id);
    setChats((prev) => [res.data, ...prev]);
  };

  const selectChat = async (chatId) => {
    if (uploading) {
      toast.error("Please wait for the current upload to finish before switching chats.");
      return;
    }

    setSelectedChat(chatId);
    setChatMessages([]);
    setChatDocuments([]);
    setIsFetchingChatData(true);

    const res = await getMessages(chatId);
    if (!res.success) {
      toast.error(res.message);
      setIsFetchingChatData(false);
      return;
    }
    setChatMessages(res.data.messages);

    const docsRes = await getDocuments(chatId);
    if (!docsRes.success) {
      toast.error(docsRes.message);
      setIsFetchingChatData(false);
      return;
    }
    setChatDocuments(docsRes.data.documents);
    setIsFetchingChatData(false);
  };

  const requestDeleteChat = (id) => setChatToDelete(id);

  const confirmDeleteChat = async () => {
    if (!chatToDelete) return;
    const id = chatToDelete;
    const res = await deleteChatAPI(id);
    if (!res.success) {
      toast.error(res.message);
      setChatToDelete(null);
      return;
    }

    // toast.success("Chat deleted");
    setChats((prev) => prev.filter((c) => c._id !== id));
    if (selectedChat === id) setSelectedChat(null);

    setChatToDelete(null);
  };

  const renameChat = async (id) => {
    const res = await renameChatAPI(id, chatNewName);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    // toast.success("Chat renamed");
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

  const requestDeleteDoc = (docId) => setDocToDelete(docId);

  const confirmDeleteDoc = async () => {
    if (!docToDelete) return;
    const docId = docToDelete;

    const res = await deleteDocumentAPI(docId);
    if (!res.success) {
      toast.error(res.message);
      setDocToDelete(null);
      return;
    }

    // toast.success("Document deleted");
    setChatDocuments((prev) => prev.filter((d) => d._id !== docId));

    setDocToDelete(null);
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

    abortControllerRef.current = new AbortController();
    let accumulatedContent = "";
    let currentUserId = null;

    const tempUserId = Date.now();
    const tempAssistantId = tempUserId + 1;

    const optimisticUserMessage = {
      _id: tempUserId,
      role: "user",
      content: message,
      created_at: new Date().toISOString(),
      isTemp: true,
    };

    const optimisticAssistantMessage = {
      _id: tempAssistantId,
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
      isTemp: true,
    };

    setChatMessages((prev) => [...prev, optimisticUserMessage, optimisticAssistantMessage]);
    setMessage("");
    setIsTyping(true);

    try {
      await createMessageStream(
        { chat_id: selectedChat, content: message, role: "user" },
        (uId, aId) => {
          currentUserId = uId;
          currentMsgIdRef.current = aId;
        },
        (chunk) => {
          accumulatedContent += chunk;
          setChatMessages(prev => prev.map(msg =>
            msg._id === tempAssistantId
              ? { ...msg, content: accumulatedContent }
              : msg
          ));
        },
        abortControllerRef.current.signal
      );

      setChatMessages(prev => prev.map(msg => {
        if (msg._id === tempAssistantId) return { ...msg, _id: currentMsgIdRef.current || msg._id, isTemp: false };
        if (msg._id === tempUserId) return { ...msg, _id: currentUserId || msg._id, isTemp: false };
        return msg;
      }));

    } catch (error) {
      if (error.name === 'AbortError') {
        if (currentMsgIdRef.current) {
          await reportAbort(currentMsgIdRef.current, accumulatedContent);
        }
        setChatMessages(prev => prev.map(msg => {
          if (msg._id === tempAssistantId) return { ...msg, is_aborted: true, isTemp: false };
          if (msg._id === tempUserId) return { ...msg, _id: currentUserId || msg._id, isTemp: false };
          return msg;
        }));
      } else {
        console.error("Stream error:", error);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const stopResponse = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
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
        deleteChat={requestDeleteChat}
        renameChat={renameChat}
        editingChatId={editingChatId}
        setEditingChatId={setEditingChatId}
        chatNewName={chatNewName}
        setChatNewName={setChatNewName}
        isFetchingChats={isFetchingChats}
        isCreatingChat={isCreatingChat}
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
        isFetchingChatData={isFetchingChatData}
        stopResponse={stopResponse}
      />

      {/* DOCUMENT PANEL */}
      <DocumentSidebar
        currentChat={currentChat}
        uploading={uploading}
        addDocument={addDocument}
        chatDocuments={chatDocuments}
        deleteDocument={requestDeleteDoc}
        renameDocument={renameDocument}
        editingDocId={editingDocId}
        setEditingDocId={setEditingDocId}
        docNewName={docNewName}
        setDocNewName={setDocNewName}
      />
      <ConfirmDialog
        open={!!chatToDelete}
        title="Delete chat?"
        content="Are you sure you want to delete this chat? This action cannot be undone."
        onCancel={() => setChatToDelete(null)}
        onConfirm={confirmDeleteChat}
      />

      <ConfirmDialog
        open={!!docToDelete}
        title="Delete file?"
        content="Are you sure you want to remove this file? The AI will no longer be able to reference it in this chat."
        onCancel={() => setDocToDelete(null)}
        onConfirm={confirmDeleteDoc}
      />
    </Box>
  );
};

export default Dashboard;