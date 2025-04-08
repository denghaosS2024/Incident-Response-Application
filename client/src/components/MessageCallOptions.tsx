import { Phone } from "@mui/icons-material";
import { IconButton, Menu, MenuItem } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { addMessage } from "../redux/messageSlice";
import request from "../utils/request";

interface MessageCallOptionsProps {
  channelId: string;
  currentUserId: string;
  onError: (message: string) => void;
}

const MessageCallOptions: React.FC<MessageCallOptionsProps> = ({
  channelId,
  currentUserId,
  onError,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isPrivateChannel, setPrivateChannel] = useState<boolean>(false);
  const menuOpen = Boolean(anchorEl);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchChannelDetails = async () => {
      try {
        const currentChannel = await request(`/api/channels/${channelId}`); // Find the current channel
        if (currentChannel) {
          setPrivateChannel(currentChannel.name === "PrivateContact"); // Check if only two users exist in the channel
        }
      } catch (error) {
        console.error("Failed to fetch channel details:", error);
      }
    };

    fetchChannelDetails();
  }, [channelId]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Option for making a phone call
  const handleMakeCall = async () => {
    // Waiting for implementing adding phone number in profile page
    try {
      console.log("Make phone call...");
      const response = await request(`/api/channels/${channelId}/phone-call`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-application-uid": currentUserId,
        },
        body: JSON.stringify({}),
      });
      const phoneNumber = response.phoneNumber;
      if (phoneNumber) {
        window.location.href = `tel:${phoneNumber}`;
      } else {
        onError(
          "The user you are calling hasn't set up their profile with a phone number.",
        );
      }
      dispatch(addMessage(response.message));
    } catch (error) {
      onError(
        "The user you are calling hasn't set up their profile. Phone calls are not available.",
      );
      console.error("Failed to make phone call:", error);
    }
    handleMenuClose();
  };

  // Option for starting a video conference
  const handleStartVideoConference = async () => {
    try {
      // Send a POST request to the video conference endpoint
      const message = await request(
        `/api/channels/${channelId}/video-conference`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-application-uid": currentUserId,
          },
          body: JSON.stringify({}),
        },
      );
      // Dispatch the new message to the Redux store
      dispatch(addMessage(message));
    } catch (error) {
      console.error("Failed to start video conference:", error);
    }
    handleMenuClose();
  };

  return (
    <>
      <IconButton color="primary" onClick={handleMenuOpen}>
        <Phone />
      </IconButton>
      <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose}>
        <MenuItem onClick={handleMakeCall} disabled={!isPrivateChannel}>
          Make Phone Call
        </MenuItem>
        <MenuItem onClick={handleStartVideoConference}>
          Start Video Conference
        </MenuItem>
      </Menu>
    </>
  );
};

export default MessageCallOptions;
