import IChannel from '@/models/Channel';
import { Box, List, ListItem, SxProps, Typography } from '@mui/material';
import { Channel } from '../ChannelList';


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
                        width: '90%',
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