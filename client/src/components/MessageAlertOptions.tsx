import { Warning } from "@mui/icons-material";
import { Box, IconButton, Popover } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addMessage } from "../redux/messageSlice";
import { AppDispatch } from "../redux/store";
import request from "../utils/request";
//import SocketClient from '../utils/Socket'
import IIncident from "@/models/Incident";
import AlertPanel from "./AlertPanel";

interface MessageAlertOptionsProps {
  channelId: string;
  currentUserId: string;
  currentUserRole: string;
}

interface IUser {
  _id: string;
  role: string;
}

const MessageAlertOptions: React.FC<MessageAlertOptionsProps> = ({
  channelId,
  currentUserId,
  currentUserRole,
}) => {
  //const socket = SocketClient
  const dispatch = useDispatch<AppDispatch>();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // TODO: Implement the logic to check if the current user is the incident commander or first responder
  // const isIncidentCommander = false

  const [responders, setResponders] = useState<string[]>([]);
  const [openAlertPanel, setOpenAlertPanel] = useState<boolean>(false);
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setOpenAlertPanel(true);
  };
  const [isIncidentCommander, setIsIncidentCommander] = useState<number>(2);
  const currentUsername = localStorage.getItem("username");
  const checkIncidentCommander = async () => {
    try {
      const incidents: IIncident[] = await request(
        `/api/incidents?channelId=${channelId}`,
        {
          method: "GET",
        },
      );
      console.log(incidents);
      const isCommander = incidents.some(
        (incident: IIncident) => incident.commander === currentUsername,
      );
      console.log(currentUsername);
      if (isCommander) {
        setIsIncidentCommander(1);
      } else {
        setIsIncidentCommander(0);
      }
    } catch (error: unknown) {
      console.error("Error fetching incidents:", error);
      console.log("not exist");
      setIsIncidentCommander(2);
    }
  };

  useEffect(() => {
    checkIncidentCommander();
  }, [channelId]);

  // Fetch the first resopnders
  const handleFetchResponders = async () => {
    const respond = await request(`/api/channels/${channelId}`, {
      method: "GET",
    });
    console.log(respond.users);
    const responders = respond.users.filter(
      (user: IUser) =>
        user._id !== currentUserId && user.role === currentUserRole,
    );
    setResponders(responders.map((responder: IUser) => responder._id));

    console.log("Responders:", responders);
  };

  // Fetch the resopnder if commander
  useEffect(() => {
    handleFetchResponders();
  }, [isIncidentCommander]);

  const handleMenuClose = () => {
    setAnchorEl(null);
    setOpenAlertPanel(false);
  };

  const sendAlert = async () => {
    const message = await request(`/api/channels/${channelId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        content: "MAYDAY-red-black",
        isAlert: true,
        responders: responders,
        acknowledgedBy: [],
        acknowledgeAt: [],
      }),
    });

    dispatch(addMessage(message));
  };

  return (
    <>
      {isIncidentCommander == 1 && (
        <IconButton color="primary" onClick={handleMenuOpen}>
          <Warning />
        </IconButton>
      )}

      <Popover
        open={openAlertPanel}
        anchorEl={anchorEl}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        {currentUserRole && (
          <Box>
            <AlertPanel
              role={currentUserRole as "Fire" | "Police"}
              channelId={channelId}
              responders={responders}
            />
          </Box>
        )}
      </Popover>

      {isIncidentCommander == 0 &&
        (currentUserRole === "Fire" || currentUserRole === "Police") && (
          <IconButton color="primary" onClick={sendAlert}>
            <Warning />
          </IconButton>
        )}

      {/* <Modal open={maydayOpen}>
          <Box
              onClick={handleDoubleTapDismiss}
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                animation: `${flash} 1s infinite`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'auto',
            }}
          >
            <Typography variant="h2" sx={{ color: 'white', fontWeight: 'bold' }}>
                MAYDAY
            </Typography>
          </Box>
        </Modal> */}
    </>
  );
};

export default MessageAlertOptions;
