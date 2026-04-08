import React from "react";
import {
  Box,
  Typography,
  Button,
  List,
  IconButton,
  TextField,
  Paper,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const DocumentSidebar = ({
  currentChat,
  uploading,
  addDocument,
  chatDocuments,
  deleteDocument,
  renameDocument,
  editingDocId,
  setEditingDocId,
  docNewName,
  setDocNewName,
}) => {
  if (!currentChat) return null;

  return (
    <Box
      sx={{
        width: 280,
        p: 2,
        flexShrink: 0,
        bgcolor: "#f0f4f9",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Button
        fullWidth
        startIcon={<UploadFileIcon />}
        component="label"
        disabled={uploading}
        disableElevation
        sx={{
          mb: 3,
          py: 1.5,
          borderRadius: "50px",
          bgcolor: "#ffffff",
          color: "#1f1f1f",
          textTransform: "none",
          fontWeight: 500,
          boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
          "&:hover": { bgcolor: "#f8f9fa", boxShadow: "0 1px 3px 0 rgba(0,0,0,0.1)" },
        }}
      >
        {uploading ? "Uploading..." : "Upload files"}
        <input
          hidden
          type="file"
          onChange={(e) => {
            addDocument(e.target.files[0]);
            e.target.value = null;
          }}
        />
      </Button>

      <Typography variant="caption" sx={{ px: 1, mb: 1, color: "#444746", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
        Files
      </Typography>

      <List sx={{ px: 0, overflowY: "auto", "&::-webkit-scrollbar": { display: "none" } }}>
        {
          chatDocuments.length === 0 ? (
          <Typography variant="body2" sx={{ px: 1, py: 3, color: "#8E8E8E", textAlign: "center", fontStyle: "italic" }}>
            No files attached yet.
          </Typography>
        ) : (
        chatDocuments.map((doc) => (
          <Paper
            key={doc._id}
            elevation={0}
            sx={{
              p: 1.5,
              mb: 1,
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: "#ffffff",
              border: "1px solid #e3e3e3",
              "&:hover .doc-actions": { opacity: 1 }
            }}
          >
            {editingDocId === doc._id ? (
              <TextField
                size="small"
                variant="standard"
                InputProps={{ disableUnderline: true }}
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
                fullWidth
                sx={{ input: { fontSize: "0.85rem" } }}
              />
            ) : (
              <>
                <Typography
                  variant="body2"
                  sx={{
                    maxWidth: 140,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontWeight: 500,
                    color: "#1f1f1f"
                  }}
                  title={doc.name}
                >
                  {doc.name}
                </Typography>
                <Box className="doc-actions" sx={{ display: "flex", opacity: 0, transition: "opacity 0.2s" }}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setEditingDocId(doc._id);
                      const nameWithoutExt = doc.name.includes(".")
                        ? doc.name.substring(0, doc.name.lastIndexOf("."))
                        : doc.name;
                      setDocNewName(nameWithoutExt);
                    }}
                    sx={{ color: "#444746", p: 0.5 }}
                  >
                    <EditIcon sx={{ fontSize: "1rem" }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => deleteDocument(doc._id)}
                    sx={{ color: "#444746", p: 0.5 }}
                  >
                    <DeleteIcon sx={{ fontSize: "1rem" }} />
                  </IconButton>
                </Box>
              </>
            )}
          </Paper>
        )))}
      </List>
    </Box>
  );
};

export default DocumentSidebar;