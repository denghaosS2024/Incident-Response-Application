import { fetchIncomingHospitalResourceRequests } from "@/redux/hospitalResourceRequestSlice";
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

interface NurseRequestDialogProps {
  hospitalId: string;
}

const NurseRequestDialog: React.FC<NurseRequestDialogProps> = ({
  hospitalId,
}) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    console.log(
      "NurseRequestDialog: Listening for nurse-specific request messages",
    );

    const handleSocketMessage = (data: string) => {
      console.log("NurseRequestDialog: Received socket message:", data);
      setOpen(true); // Open the dialog when a message is received
    };

    // Listen for the "hospital-nurse-new-request" event
    SocketClient.on("hospital-nurse-new-request", handleSocketMessage);

    // Cleanup the listener when the component is unmounted
    return () => {
      SocketClient.off("hospital-nurse-new-request");
    };
  }, []);

  const handleOK = async () => {
    const targetPath = `/hospital/${hospitalId}/resource-request/directory`;
    if (location.pathname === targetPath) {
      // If already on the target route, dispatch fetchIncomingRequests
      await dispatch(fetchIncomingHospitalResourceRequests(hospitalId));
    }

    setOpen(false);
  };

  const handleGOSEE = async () => {
    setOpen(false);
    const targetPath = `/hospital/${hospitalId}/resource-request/directory`;

    if (location.pathname === targetPath) {
      // If already on the target route, dispatch fetchIncomingRequests
      await dispatch(fetchIncomingHospitalResourceRequests(hospitalId));
    } else {
      // Otherwise, navigate to the target route
      navigate(targetPath);
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>New Request</DialogTitle>
      <DialogContent>
        {"A new request has been made for your hospital. Please review it."}
      </DialogContent>
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

export default NurseRequestDialog;
