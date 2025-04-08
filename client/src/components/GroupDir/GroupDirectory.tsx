import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import IChannel from "../../models/Channel";
import request from "../../utils/request";
import SocketClient from "../../utils/Socket";
import GroupListBlock from "./GroupListBlock";

const GroupDirectory: React.FC = () => {
  const [myManagingChannels, setMyManagingChannels] = useState<IChannel[]>([]);
  const [myParticipatingChannels, setMyParticipatingChannels] = useState<
    IChannel[]
  >([]);
  const [myclosedChannels, setMyclosedChannels] = useState<IChannel[]>([]);
  const owner = localStorage.getItem("uid") ?? "";
  const fetchGroups = async () => {
    try {
      const myGroups = await request(`/api/channels/groups/${owner}`, {
        method: "GET",
      }).catch((error) => {
        console.error("Error fetching groups:", error);
        return [];
      });

      const activeGroups = myGroups
        .filter((group: IChannel) => !group.closed)
        .sort((a: IChannel, b: IChannel) => a.name.localeCompare(b.name));
      setMyParticipatingChannels(activeGroups);

      const ownedGroups = myGroups
        .filter(
          (group: IChannel) => group.owner?._id === owner && !group.closed,
        )
        .sort((a: IChannel, b: IChannel) => a.name.localeCompare(b.name));
      setMyManagingChannels(ownedGroups);

      let allClosedGroups = await request(`/api/channels/groups/closed`, {
        method: "GET",
      }).catch((error) => {
        console.error("Error fetching closed groups:", error);
        return [];
      });
      allClosedGroups = allClosedGroups
        // .filter((channel: IChannel) => {
        //   // keep only groups owned by current user
        //   return channel.name !== "PrivateContact" && channel.owner._id === owner;
        // })
        .sort((a: IChannel, b: IChannel) => a.name.localeCompare(b.name));
      setMyclosedChannels(allClosedGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };
  useEffect(() => {
    fetchGroups();
    const socket = SocketClient;
    socket.connect();
    socket.on("updateGroups", fetchGroups);
    return () => {
      socket.off("updateGroups");
    };
  }, []);

  return (
    <Box
      sx={{
        borderRadius: "8px",
        mx: "auto",
        display: "grid",
        placeItems: "center" /* Centers vertically */,
      }}
    >
      <GroupListBlock
        headerName="Groups I am managing"
        id="managing"
        groups={myManagingChannels}
      />
      <GroupListBlock
        headerName="Groups I am participating in"
        id="participating"
        groups={myParticipatingChannels}
      />
      <GroupListBlock
        headerName="Closed Groups"
        id="closed"
        groups={myclosedChannels}
      />
    </Box>
  );
};

export default GroupDirectory;
