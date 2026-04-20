import React, { useState, useRef, useEffect } from "react";
import StopIcon from "@mui/icons-material/Stop";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Box, Typography, IconButton, TextField, Paper, Fab, Zoom, CircularProgress } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import CustomPre from "./Custom.jsx";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download"; // Using Download icon as requested
import { MessageCopyButton } from "./Custom.jsx";

const ChatArea = ({
  currentChat,
  chatMessages,
  message,
  setMessage,
  sendMessage,
  chatEndRef,
  isTyping,
  isFetchingChatData,
  stopResponse,
}) => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    setShowScrollButton(false);
  }, [currentChat?._id]);

  useEffect(() => {
    if (!showScrollButton) {
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    }
  }, [chatMessages, isTyping, isFetchingChatData]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      setShowScrollButton(!isNearBottom);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!showScrollButton) {
      scrollToBottom();
    }
  }, [chatMessages, isTyping]);

  const handleSaveAsPdf = () => {
    const chatElement = document.getElementById("print-chat-content");
    if (!chatElement) return;

    const printClone = chatElement.cloneNode(true);
    const title = document.createElement("h2");
    title.innerText = currentChat?.name || "Chat";
    title.style.textAlign = "center";
    title.style.marginBottom = "20px";

    printClone.prepend(title);
    const printWrapper = document.createElement("div");
    printWrapper.id = "temp-print-wrapper";
    printWrapper.appendChild(printClone);
    document.body.appendChild(printWrapper);

    const printStyle = document.createElement("style");
    printStyle.innerHTML = `
      @media print {
        body > *:not(#temp-print-wrapper) {
          display: none !important;
        }
        
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        #temp-print-wrapper {
          display: block !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        #temp-print-wrapper #print-chat-content {
          overflow: visible !important;
          height: auto !important;
          display: block !important;
          padding: 20px !important;
        }

        /* Hide buttons inside the cloned print view */
        #temp-print-wrapper button, 
        #temp-print-wrapper .MuiIconButton-root {
          display: none !important;
        }
        
        /* Prevent message bubbles from breaking in half across pages */
        .message-box {
          page-break-inside: avoid;
          break-inside: avoid;
        }
      }
    `;
    document.head.appendChild(printStyle);

    window.print();

    setTimeout(() => {
      document.body.removeChild(printWrapper);
      document.head.removeChild(printStyle);
    }, 100);
  };
  return (
    <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", position: "relative", height: "100%" }}>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: { xs: 2, md: 3 },
          py: 1.5,
          zIndex: 10,
        }}
      >
        {/* TOP LEFT NAME */}
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #4285f4 0%, #9b72cb 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 3,
            color: "#fff",
            fontSize: "1rem",
            fontWeight: "bold",
            boxShadow: "0 8px 16px rgba(66, 133, 244, 0.2)"
          }}
        >
          N
        </Box>

        {/* TOP RIGHT SAVE AS PDF BUTTON */}
        {currentChat && chatMessages.length > 0 && (
          <Button
            disableElevation
            startIcon={<DownloadIcon sx={{ fontSize: "1.2rem" ,color:"#444746"}} />}
            onClick={handleSaveAsPdf}
            sx={{
              bgcolor: "#d3e3fd", 
              color: "#444746",    
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.875rem",
              borderRadius: "50px",
              mb: 0.5,
              py: 1,
              px: 2.5,
              transition: "all 0.2s ease-in-out",
              border: "none",
              "&:hover": {
                bgcolor: "#c2d7fa",
                boxShadow: "none",
              },
              "&:active": {
                bgcolor: "#b1c5e7",
              },
              "& .MuiButton-startIcon": {
                mr: 1,
                color: "#041e49",
              }
            }}
          >
            Export PDF
          </Button>
        )}
      </Box>
      {currentChat ? (
        <>
          <Box
            id="print-chat-content"
            ref={scrollContainerRef}
            onScroll={handleScroll}
            sx={{
              flexGrow: 1,
              p: { xs: 2, md: 4 },
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box sx={{ width: "100%", maxWidth: 800 }}>

              {isFetchingChatData ? (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
                  <CircularProgress size={40} sx={{ color: "#1a73e8" }} />
                </Box>
              ) : (
                <>
                  {chatMessages.length === 0 && !isTyping && (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", mt: 10, textAlign: "center" }}>
                      <Typography variant="h4" sx={{ color: "#1f1f1f", fontWeight: 600, mb: 1, letterSpacing: "-0.5px" }}>
                        Hello again
                      </Typography>
                      <Typography variant="h6" sx={{ color: "#444746", fontWeight: 400, mb: 4 }}>
                        What's on your mind today?
                      </Typography>
                      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center", maxWidth: 600 }}>
                        {["Create a step-by-step plan to get promoted at work", "Help me write an email", "Brainstorm some ideas", "Explain a complex topic"].map((prompt, index) => (
                          <Paper
                            key={index}
                            elevation={0}
                            onClick={() => setMessage(prompt)}
                            sx={{
                              p: 2,
                              px: 3,
                              bgcolor: "#ffffff",
                              border: "1px solid #e3e3e3",
                              borderRadius: "16px",
                              cursor: "pointer",
                              transition: "all 0.2s",
                              "&:hover": { bgcolor: "#f0f4f9", borderColor: "#c4c7c5", transform: "translateY(-2px)" }
                            }}
                          >
                            <Typography variant="body2" sx={{ color: "#444746", fontWeight: 500 }}>
                              {prompt}
                            </Typography>
                          </Paper>
                        ))}
                      </Box>
                    </Box>
                  )}
                  {chatMessages.map((msg) => (
                    <Box
                      key={msg._id}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                        "&:hover .msg-action-btn": { opacity: 1 },
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: msg.role === "user" ? "80%" : "100%",
                          px: msg.role === "user" ? 3 : 1,
                          py: msg.role === "user" ? 1.5 : 0,
                          borderRadius: msg.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                          bgcolor: msg.role === "user" ? "#f0f4f9" : "transparent",
                          color: "#1f1f1f",
                          wordBreak: "break-word",
                          fontSize: "1rem",
                          lineHeight: 1.6,

                          "& pre": {
                            borderRadius: "12px",
                            overflowX: "auto",
                            maxWidth: "100%",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            bgcolor: "#f0f4f9",
                            mt: 1,
                            border: "1px solid #e3e3e3",
                          },
                          "& code": {
                            backgroundColor: "#f0f4f9",
                            padding: "2px 6px",
                            borderRadius: "6px",
                            fontFamily: "'Roboto Mono', monospace",
                            fontSize: "0.85rem",
                            color: "#1f1f1f"
                          },
                          "& p": { margin: "0 0 12px 0", "&:last-child": { mb: 0 } },
                        }}
                      >
                        {msg.role === "assistant" ? (
                          <>
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeHighlight]}
                              components={{
                                pre: CustomPre
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                            {msg.is_aborted && (
                              <Typography variant="caption"
                                sx={{
                                  display: "inline-block",
                                  color: "#444746",
                                  borderRadius: "16px",
                                  fontSize: "0.8rem",
                                  fontWeight: 500,
                                  userSelect: "none",
                                  fontStyle: "italic",
                                }}
                              >
                                You stopped this response
                              </Typography>
                            )}</>
                        ) : (
                          msg.content
                        )}

                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mt: 0.5,
                          flexDirection: msg.role === "user" ? "row-reverse" : "row"
                        }}
                      >
                        {!msg.isTemp && <MessageCopyButton text={msg.content} />}
                      </Box>
                    </Box>
                  ))}

                  {isTyping && (
                    <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 3 }}>
                      <Box sx={{ px: 1, py: 1.5, display: "flex", gap: 0.8, alignItems: "center", height: "24px" }}>
                        {[0, 1, 2].map((i) => (
                          <Box
                            key={i}
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: "#a8c7fa",
                              animation: "pulse 1.4s infinite ease-in-out both",
                              animationDelay: `${i * 0.16}s`,
                              "@keyframes pulse": {
                                "0%, 80%, 100%": { transform: "scale(0.6)", opacity: 0.4 },
                                "40%": { transform: "scale(1)", opacity: 1 },
                              },
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </>
              )}
              <div ref={chatEndRef} />
            </Box>
          </Box>
          <Zoom in={showScrollButton}>
            <Fab
              size="small"
              onClick={scrollToBottom}
              sx={{
                position: "absolute",
                bottom: 90,
                left: "50%",
                transform: "translateX(-50%)",
                bgcolor: "rgba(255, 255, 255, 0.9)",
                color: "#444746",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                "&:hover": { bgcolor: "#f0f4f9" },
                zIndex: 10,
              }}
            >
              <KeyboardArrowDownIcon />
            </Fab>
          </Zoom>
          {/* INPUT */}
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "center",
              bgcolor: "linear-gradient(to top, #ffffff 50%, transparent)",
            }}
          >
            <Paper
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                maxWidth: 800,
                bgcolor: "#f0f4f9",
                borderRadius: "32px",
                p: "8px 16px",
              }}
            >
              <TextField
                fullWidth
                placeholder="Ask ..."
                variant="standard"
                InputProps={{ disableUnderline: true }}
                multiline
                maxRows={5}
                value={message}
                disabled={isFetchingChatData}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!isTyping) {
                      sendMessage();
                      scrollToBottom();
                    } else {
                      stopResponse();
                    }
                  }
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    fontSize: "1rem",
                    color: "#1f1f1f",
                    lineHeight: 1.5,
                    py: 1
                  }
                }}
              />
              <IconButton
                onClick={isTyping ? stopResponse : sendMessage}
                disabled={(!message.trim() && !isTyping) || isFetchingChatData}
                sx={{
                  ml: 1,
                  bgcolor: message.trim() || isTyping ? "#d3e3fd" : "transparent",
                  color: message.trim() || isTyping ? "#041e49" : "#444746",
                  transition: "all 0.2s",
                  "&:hover": { bgcolor: message.trim() || isTyping ? "#c2d7fa" : "transparent" },
                }}
              >
                {isTyping ? <StopIcon fontSize="small" /> : <SendIcon fontSize="small" />}
              </IconButton>
            </Paper>
          </Box>
        </>
      ) : (
        /* IMPROVED EMPTY STATE (NO CHAT SELECTED) */
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: { xs: 2, md: 4 } }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: "32px",
              background: "linear-gradient(145deg, #f8faff 0%, #f0f4f9 100%)",
              border: "1px solid #e3e3e3",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              maxWidth: 500,
              boxShadow: "0 12px 40px rgba(0,0,0,0.04)"
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #4285f4 0%, #9b72cb 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
                color: "#fff",
                fontSize: "2.5rem",
                fontWeight: "bold",
                boxShadow: "0 8px 16px rgba(66, 133, 244, 0.2)"
              }}
            >
              N
            </Box>
            <Typography variant="h4" sx={{ color: "#1f1f1f", fontWeight: 600, mb: 2, letterSpacing: "-0.5px" }}>
              Welcome to NoteAI
            </Typography>
            <Typography variant="body1" sx={{ color: "#444746", fontWeight: 400, lineHeight: 1.6 }}>
              Your intelligent assistant is ready. Select a chat from the sidebar or start a new conversation to begin exploring ideas.
            </Typography>
          </Paper>
        </Box>
      )}
    </Box >
  );
};

export default ChatArea;