import { Box, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import ChatBox from "../components/Chat/ChatBox";
import IChannel, { resolveChannelName } from "../models/Channel";
import IHospital from "../models/Hospital";
import { addMessage, loadMessages } from "../redux/messageSlice";
import { AppDispatch, RootState } from "../redux/store";
import request from "../utils/request";

interface ChatRoomProps {
  channelId: string;
}

// ChatRoomPage component: Displays messages for a specific channel and allows sending new messages
const ChatRoom: React.FC<ChatRoomProps> = ({ channelId }) => {
  // Retrieve current user ID
  const currentUserId = localStorage.getItem("uid") ?? "";
  // Retrieve current user role
  const currentUserRole = localStorage.getItem("role") ?? "";
  // Get messages for the current channel from Redux store
  const messages = useSelector(
    (state: RootState) => state.messageState.messages,
  )[channelId];
  const dispatch = useDispatch<AppDispatch>();
  const history = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [channelName, setChannelName] = useState<string>("");
  const [isHospitalGroup, setIsHospitalGroup] = useState<boolean>(false);

  // Function to send a new message
  const sendMessage = async (content: string, channelId: string) => {
    const message = await request(`/api/channels/${channelId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        content: content,
        isAlert: false,
      }),
    });
    dispatch(addMessage(message));
  };

  // Load channel info and set channel name
  const loadChannelInfo = async () => {
    const channel = await request(`/api/channels/${channelId}`);
    console.log("Channel:", channel);
    if (channel) {
      const resolvedChannel = resolveChannelName(channel);
      setChannelName(resolvedChannel.name);

      // Check if this channel is a hospital group chat
      try {
        const hospitals: IHospital[] = await request("/api/hospital");
        const isHospital = hospitals.some(
          (hospital: IHospital) => hospital.hospitalGroupId === channelId,
        );
        setIsHospitalGroup(isHospital);
      } catch (error) {
        console.error("Error checking if channel is a hospital group:", error);
        setIsHospitalGroup(false);
      }
    } else {
      const channels: IChannel[] = await request("/api/channels");
      const publicChannel = channels.filter(
        (channel: IChannel) => channel.name === "Public",
      )[0];
      if (publicChannel) {
        setChannelName(publicChannel.name);
      }
    }
  };

  useEffect(() => {
    loadChannelInfo();
    // Load messages for the current channel
    dispatch(loadMessages(channelId));
    setIsLoading(false);
  }, [channelId, dispatch, history]);

  // Reuse ChatBox component
  return (
    <Box sx={{ height: "100%" }}>
      <Box sx={{ borderBottom: "1px solid #ccc" }}>
        <Typography variant="h6" fontWeight="bold">
          {channelName}
        </Typography>
      </Box>
      <ChatBox
        channelId={channelId}
        messages={messages || []}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        isLoading={isLoading}
        onSendMessage={sendMessage}
        isHospitalGroup={isHospitalGroup}
      />
    </Box>
  );
};

export default ChatRoom;
