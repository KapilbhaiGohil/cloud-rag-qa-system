import React, { useState } from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button,
  CircularProgress
} from "@mui/material";

const ConfirmDialog = ({ open, title, content, onConfirm, onCancel,confirmText = "Delete"}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : onCancel} 
      PaperProps={{ 
        sx: { 
          borderRadius: "24px", 
          p: 1,
          minWidth: "320px"
        } 
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, color: "#1f1f1f", pb: 1 }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: "#444746", fontSize: "0.95rem" }}>
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={onCancel}
          disabled={loading}
          sx={{ 
            color: "#444746", 
            textTransform: "none", 
            fontWeight: 500,
            borderRadius: "50px",
            px: 2,
            "&.Mui-disabled": { color: "#a0a0a0" }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading}   
          disableElevation
          variant="contained"
          color="error"
          sx={{ 
            textTransform: "none", 
            fontWeight: 500, 
            borderRadius: "50px", 
            px: 3,
            minWidth: "90px",   
            bgcolor: "#d32f2f",
            "&:hover": { bgcolor: "#b71c1c" },
            "&.Mui-disabled": { bgcolor: "#e57373", color: "#ffffff" }
          }}
        >
          {loading ? <CircularProgress size={23} color="inherit" /> : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;