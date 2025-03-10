import { useEffect, useState } from 'react'
import IChannel from '@/models/Channel';
import { Channel, IChannelProps } from '../ChannelList';
import request from '@/utils/request';
import { Box, List, ListItem, SxProps, Typography } from '@mui/material';


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
                <Typography
                    variant="h6"
                    sx={{ mb: 2}}
                    >
                    {headerName}
                </Typography>
            </div>

            <List className="group-item" sx={{ width: '100%' }}>
                {
                    groups.map(group => (
                        <ListItem key={group._id} disablePadding sx={{ width: '90%', marginLeft: "1%"}}>
                        <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '5px 5px',
                        border: '1.5px solid #ddd',
                        borderRadius: '8px',
                        backgroundColor: '#1976d2',
                        color: 'white',
                        marginBottom: '8px',
                        width: '90%',
                        mx: 'auto',
                        cursor: 'pointer',
                        }}>
                            <Channel channel={group} isSettingButton={id !== "closed"} />
                        </Box>
                            </ListItem>
                    ))
                }
            </List>

        </div>
    );
};


export default GroupListBlock;