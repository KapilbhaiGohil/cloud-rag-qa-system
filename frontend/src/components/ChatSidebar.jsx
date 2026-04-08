import React from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";

const ChatSidebar = ({
  user,
  logout,
  chats,
  selectedChat,
  addChat,
  selectChat,
  deleteChat,
  renameChat,
  editingChatId,
  setEditingChatId,
  chatNewName,
  setChatNewName,
}) => {
  return (
    <Box
      sx={{
        width: 280,
        p: 2,
        flexShrink: 0,
        bgcolor: "#f0f4f9",
        display: "flex",
        flexDirection: "column",
        borderRight: "none",
      }}
    >
      <Button
        fullWidth
        startIcon={<AddIcon />}
        onClick={addChat}
        disableElevation
        sx={{
          mb: 3,
          py: 1.5,
          borderRadius: "50px",
          bgcolor: "#ffffff",
          color: "#1f1f1f",
          textTransform: "none",
          fontSize: "0.95rem",
          fontWeight: 500,
          boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
          "&:hover": { bgcolor: "#f8f9fa", boxShadow: "0 1px 3px 0 rgba(0,0,0,0.1)" },
        }}
      >
        New chat
      </Button>

      <Typography variant="caption" sx={{ px: 2, mb: 1, color: "#444746", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
        Recent
      </Typography>

      <List sx={{ flexGrow: 1, overflowY: "auto", px: 0, "&::-webkit-scrollbar": { display: "none" } }}>

        {
          chats.length === 0 ? (
            <Typography variant="body2" sx={{ px: 2, py: 3, color: "#8E8E8E", textAlign: "center", fontStyle: "italic" }}>
              No recent chats. Start a new one!
            </Typography>
          ) : (
            chats.map((chat) => (
              <ListItemButton
                key={chat._id}
                selected={selectedChat === chat._id}
                onClick={() => selectChat(chat._id)}
                sx={{
                  borderRadius: "50px",
                  mb: 0.5,
                  py: 1,
                  px: 2,
                  "&.Mui-selected": {
                    bgcolor: "#d3e3fd",
                    color: "#041e49",
                    "&:hover": { bgcolor: "#c2d7fa" },
                  },
                  "&:hover": {
                    bgcolor: "#e1e5ea",
                  },
                  "&:hover .chat-actions": {
                    opacity: 1,
                  }
                }}
              >
                {editingChatId === chat._id ? (
                  <TextField
                    size="small"
                    variant="standard"
                    InputProps={{ disableUnderline: true }}
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
                    sx={{ input: { color: "#1f1f1f", fontSize: "0.9rem" } }}
                  />
                ) : (
                  <>
                    <ListItemText
                      primary={chat.name}
                      primaryTypographyProps={{
                        fontSize: "0.9rem",
                        fontWeight: selectedChat === chat._id ? 500 : 400,
                        noWrap: true
                      }}
                    />
                    <Box className="chat-actions" sx={{ display: "flex", opacity: selectedChat === chat._id ? 1 : 0, transition: "opacity 0.2s" }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingChatId(chat._id);
                          setChatNewName(chat.name);
                        }}
                        sx={{ color: "#444746", p: 0.5, mr: 0.5 }}
                      >
                        <EditIcon sx={{ fontSize: "1.1rem" }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat._id);
                        }}
                        sx={{ color: "#444746", p: 0.5 }}
                      >
                        <DeleteIcon sx={{ fontSize: "1.1rem" }} />
                      </IconButton>
                    </Box>
                  </>
                )}
              </ListItemButton>
            )))}
      </List>

      <Box sx={{ mt: 2, p: 2, bgcolor: "#e8eaed", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="body2" sx={{ fontWeight: 500, color: "#1f1f1f", overflow: "hidden", textOverflow: "ellipsis" }}>
          {user?.username}
        </Typography>
        <IconButton onClick={logout} size="small" sx={{ color: "#444746" }}>
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatSidebar;