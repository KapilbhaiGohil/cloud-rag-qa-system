import React, { useState, useRef } from "react";
import { Box, IconButton } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";

const CustomPre = ({ children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const preRef = useRef(null);

  const handleCopy = () => {
    if (preRef.current) {
      navigator.clipboard.writeText(preRef.current.innerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Box sx={{ position: "relative", mt: 1, "&:hover .copy-btn": { opacity: 1 } }}>
      <IconButton
        className="copy-btn"
        size="small"
        onClick={handleCopy}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          opacity: { xs: 1, sm: 0 }, 
          transition: "opacity 0.2s",
          bgcolor: "rgba(255, 255, 255, 0.9)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          "&:hover": { bgcolor: "#ffffff" },
          zIndex: 1,
        }}
      >
        {copied ? (
          <CheckIcon sx={{ fontSize: "1.1rem", color: "green" }} />
        ) : (
          <ContentCopyIcon sx={{ fontSize: "1rem", color: "#444746" }} />
        )}
      </IconButton>
      
      <pre ref={preRef} {...props} style={{ margin: 0 }}>
        {children}
      </pre>
    </Box>
  );
};
const MessageCopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <IconButton
      className="msg-action-btn"
      size="small"
      onClick={handleCopy}
      title="Copy message"
      sx={{
        p: 0.5,
        color: copied ? "green" : "#444746",
        opacity: { xs: 1, sm: 0 }, 
        transition: "opacity 0.2s, color 0.2s",
        "&:hover": { color: "#1a73e8", backgroundColor: "rgba(26, 115, 232, 0.08)" },
      }}
    >
      {copied ? <CheckIcon sx={{ fontSize: "1rem" }} /> : <ContentCopyIcon sx={{ fontSize: "1rem" }} />}
    </IconButton>
  );
};
export default CustomPre;
export { MessageCopyButton };