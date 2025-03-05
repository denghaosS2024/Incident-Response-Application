import IChannel from '../models/Channel';
import { useState, useEffect } from 'react';
import GroupListBlock from '../components/GroupDir/GroupListBlock';
import { Box } from '@mui/material';
import request from '../utils/request';
import SocketClient from '../utils/Socket';




const GroupDirectoryPage: React.FC = () => {
    const [myManagingChannels, setMyManagingChannels] = useState<IChannel[]>([]);
    const [myParticipatingChannels, setMyParticipatingChannels] = useState<IChannel[]>([]);
    const owner = localStorage.getItem('uid') || '';


    const fetchGroups = async () => {
        try {
            const myGroups = await request(`/api/channels/groups/${owner}`, {
                method: 'GET',
            }).catch((error) => {
                console.error("Error fetching groups:", error);
                return []
            });
            setMyParticipatingChannels(myGroups);
            const ownedGroups = myGroups.filter((group: IChannel) => group.owner._id === owner);
            setMyManagingChannels(ownedGroups);
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
                backgroundColor:"#fef9e7",
            }}>
            <h1>Group Directory</h1>
            <GroupListBlock
                headerName="Group I am managing"
                id="managing"
                groups={myManagingChannels}
            />
            <GroupListBlock
                headerName="Group I am participating in"
                id="participating"
                groups={myParticipatingChannels}
            />
        </Box>
    );
}

export default GroupDirectoryPage;