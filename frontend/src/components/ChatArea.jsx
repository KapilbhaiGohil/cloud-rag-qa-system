import React, { useState, useRef, useEffect } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Box, Typography, IconButton, TextField, Paper, Fab, Zoom } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import CustomPre from "./Custom.jsx";
import { MessageCopyButton } from "./Custom.jsx";
const ChatArea = ({
  currentChat,
  chatMessages,
  message,
  setMessage,
  sendMessage,
  chatEndRef,
  isTyping,
}) => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollContainerRef = useRef(null);
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
  return (
    <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", position: "relative" }}>
      {currentChat ? (
        <>
          <Box
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
              {chatMessages.length === 0 && !isTyping && (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", mt: 10, textAlign: "center" }}>
                  <Typography variant="h5" sx={{ color: "#1f1f1f", fontWeight: 500, mb: 4 }}>
                    What's on your mind?
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center", maxWidth: 600 }}>
                    {["Summarize my documents", "Help me write an email", "Brainstorm some ideas", "Explain a complex topic"].map((prompt, index) => (
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
                          "&:hover": { bgcolor: "#f0f4f9", borderColor: "#c4c7c5" }
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
                    animation: msg.isTemp ? "messagePulse 1.5s infinite ease-in-out" : "none",
                    "@keyframes messagePulse": {
                      "0%, 100%": { opacity: 0.4 },
                      "50%": { opacity: 0.8 },
                    },
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
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                          pre: CustomPre
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
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
                    <MessageCopyButton text={msg.content} />
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
              <div ref={chatEndRef} />
            </Box>
          </Box>
          <Zoom in={showScrollButton}>
            <Fab
              size="small"
              onClick={scrollToBottom}
              sx={{
                position: "absolute",
                bottom: 90, // Places it comfortably above the text input
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
                placeholder="Ask Gemini..."
                variant="standard"
                InputProps={{ disableUnderline: true }}
                multiline
                maxRows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
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
                onClick={sendMessage}
                disabled={!message.trim()}
                sx={{
                  ml: 1,
                  bgcolor: message.trim() ? "#d3e3fd" : "transparent",
                  color: message.trim() ? "#041e49" : "#444746",
                  transition: "all 0.2s",
                  "&:hover": { bgcolor: message.trim() ? "#c2d7fa" : "transparent" },
                }}
              >
                <SendIcon fontSize="small" />
              </IconButton>
            </Paper>
          </Box>
        </>
      ) : (
        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
          <Typography variant="h4" sx={{ color: "#c4c7c5", fontWeight: 500, letterSpacing: "-0.5px" }}>
            How can I help you today?
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ChatArea;