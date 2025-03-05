import { useEffect, useState } from 'react'
import IChannel from '@/models/Channel';
import {Channel, IChannelProps} from '../ChannelList';
import request from '@/utils/request';
import { Box, List, ListItem } from '@mui/material';


interface GroupListBlockProps {
    headerName: string;
    id: string;
    groups: IChannel[]; 
}

const GroupListBlock: React.FC<GroupListBlockProps> = ({ headerName, id, groups }) => {
    return (
        <Box key={id} >
            <h2>{headerName}</h2>
            <List>
                {groups.map((group) => (
                    <ListItem key={group._id}>
                        <Channel channel={group} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default GroupListBlock;