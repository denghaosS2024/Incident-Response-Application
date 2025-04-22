import { AppDispatch } from "@/redux/store";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import SocketClient from "../../../utils/Socket";

interface NurseResourceLowStockProps {
  hospitalId: string;
}

const NurseResourceLowStock: React.FC<NurseResourceLowStockProps> = ({
  hospitalId,
}) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string>(""); // Message to display in the dialog
  const [resourceId, setResourceId] = useState<string | null>(null); // Whether the request was accepted or rejected
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    const handleSocketMessage = (data: {
      message: string;
      resourceId: string;
    }) => {
      console.log("NurseResourceLowStock: Received socket message:", data);
      setMessage(data.message);
      setResourceId(data.resourceId);
      setOpen(true); // Open the dialog when a message is received
    };

    // Listen for the "hospital-nurse-request-proceeded" event
    SocketClient.on("hospital-resource-low-quantity", handleSocketMessage);

    // Cleanup the listener when the component is unmounted
    return () => {
      SocketClient.off("hospital-nurse-request-anwsered");
    };
  }, []);

  const handleOK = async () => {
    setOpen(false);
  };

  const handleGOSEE = async () => {
    setOpen(false);
    const targetPath = `/hospital/${hospitalId}/resource/${resourceId}/update`;

    navigate(targetPath);
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>{"Resource Low Stock Alert"}</DialogTitle>
      <DialogContent>{message}</DialogContent>
      <DialogActions>
        <Button onClick={handleOK} color="secondary">
          OK
        </Button>
        <Button onClick={handleGOSEE} color="primary">
          GO SEE
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NurseResourceLowStock;
