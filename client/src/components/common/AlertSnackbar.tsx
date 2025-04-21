import { Alert, AlertColor, Snackbar } from "@mui/material";
import React from "react";

interface AlertSnackbarProps {
  open: boolean;
  message: string;
  severity?: AlertColor;
  onClose: () => void;
  autoHideDuration?: number;
  vertical?: "top" | "bottom";
  horizontal?: "left" | "center" | "right";
}

const AlertSnackbar: React.FC<AlertSnackbarProps> = ({
  open,
  message,
  severity = "error", // Default to 'error'
  onClose,
  autoHideDuration = 6000, // Default duration
  vertical = "bottom", // Default vertical position
  horizontal = "center", // Default horizontal position
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical, horizontal }} // Use the position props
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 9999,
        width: "auto",
        whiteSpace: "pre-line",
      }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AlertSnackbar;
