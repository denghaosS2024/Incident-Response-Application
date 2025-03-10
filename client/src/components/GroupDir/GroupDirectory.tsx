import IChannel from '../../models/Channel';
import { useState, useEffect } from 'react';
import GroupListBlock from './GroupListBlock';
import { Box, Typography } from '@mui/material';
import request from '../../utils/request';
import SocketClient from '../../utils/Socket';




const GroupDirectory: React.FC = () => {
    const [myManagingChannels, setMyManagingChannels] = useState<IChannel[]>([]);
    const [myParticipatingChannels, setMyParticipatingChannels] = useState<IChannel[]>([]);
    const [myclosedChannels, setMyclosedChannels] = useState<IChannel[]>([]);
    const owner = localStorage.getItem('uid') || '';
    const fetchGroups = async () => {
        try {
            const myGroups = await request(`/api/channels/groups/${owner}`, {
                method: 'GET',
            }).catch((error) => {
                console.error("Error fetching groups:", error);
                return []
            });
            const activeGroups = myGroups.filter((group: IChannel) => !group.closed);
            setMyParticipatingChannels(activeGroups);
            const ownedGroups = myGroups.filter((group: IChannel) => group.owner._id === owner && !group.closed);
            setMyManagingChannels(ownedGroups);

            const allClosedGroups = await request(`/api/channels/groups/closed`, {
                method: 'GET',
            }).catch((error) => {
                console.error("Error fetching closed groups:", error);
                return [];
            });
            setMyclosedChannels(allClosedGroups);
        } catch (error) {
            console.error("Error fetching groups:", error);
        }
    };
    useEffect(() => {
        fetchGroups();
        const socket = SocketClient
        socket.connect();
        socket.on("updateGroups", fetchGroups)
        return () => {
            socket.off("updataGroups")
        }

    }, []);

    return (
        <Box sx={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '1rem',
            mx: 'auto',
        }}>
            <Typography
            variant="h3"
            sx={{ mb: 2 }}
            >
            Group Directory
            </Typography>
            <GroupListBlock
                headerName="Groups I am managing"
                id="managing"
                groups={myManagingChannels}
            />
            <GroupListBlock
                headerName="Group I am participating in"
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
}

export default GroupDirectory;