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
            <List className="group-item">
                {
                    groups.map(group => (
                        <div key={group._id}>
                            <Channel channel={group} isSettingButton={true} />
                        </div>
                    ))
                }
            </List>
        </div>
    );
};


export default GroupListBlock;