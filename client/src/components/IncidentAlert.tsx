import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

interface IncidentAlertProps {
  isOpen: boolean;
  onClose: () => void;
  onNav: () => void;
  incidentId: string;
}

const IncidentAlert: React.FC<IncidentAlertProps> = ({
  isOpen,
  onClose,
  onNav,
  incidentId,
}) => {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Alert</DialogTitle>
      <DialogContent>
        <Typography>You have been assigned to Incident {incidentId}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          OK
        </Button>
        <Button onClick={onNav} variant="contained">
          GO SEE
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IncidentAlert;
