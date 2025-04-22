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

interface NurseRequestAnswerDialogProps {
  hospitalId: string;
}

const NurseRequestAnswerDialog: React.FC<NurseRequestAnswerDialogProps> = ({
  hospitalId,
}) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string>(""); // Message to display in the dialog
  const [accepted, setAccepted] = useState<boolean | null>(null); // Whether the request was accepted or rejected
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    console.log(
      "NurseRequestAnswerDialog: Listening for request proceeded messages",
    );

    const handleSocketMessage = (data: {
      message: string;
      accepted: boolean;
    }) => {
      console.log("NurseRequestAnswerDialog: Received socket message:", data);
      setMessage(data.message);
      setAccepted(data.accepted);
      setOpen(true); // Open the dialog when a message is received
    };

    // Listen for the "hospital-nurse-request-proceeded" event
    SocketClient.on("hospital-nurse-request-anwsered", handleSocketMessage);

    // Cleanup the listener when the component is unmounted
    return () => {
      SocketClient.off("hospital-nurse-request-anwsered");
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
      <DialogTitle>
        {accepted ? "Request Accepted" : "Request Rejected"}
      </DialogTitle>
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

export default NurseRequestAnswerDialog;
