import { useEffect, useState } from 'react'
import IChannel from '@/models/Channel';
import { Channel, IChannelProps } from '../ChannelList';
import request from '@/utils/request';
import { Box, List, ListItem, SxProps } from '@mui/material';


interface GroupListBlockProps {
    headerName: string;
    id: string;
    groups: IChannel[];
}

const GroupStyle: SxProps = {
    width: '100%',
}

const GroupListBlock: React.FC<GroupListBlockProps> = ({ headerName, id, groups }) => {
    return (
        <div>
            <div className="group-subheader" id={id}>
                <h3>{headerName}</h3>
            </div>

            <List className="group-item" sx={{ width: '100%' }}>
                {
                    groups.map(group => (
                        <ListItem key={group._id} disablePadding sx={{ width: '90%' }}>
                            <Channel channel={group} isSettingButton={id !== "closed"} />
                        </ListItem>
                    ))
                }
            </List>

        </div>
    );
};


export default GroupListBlock;