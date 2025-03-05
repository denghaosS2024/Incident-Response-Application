
import IChannel from '../models/Channel'
import { useState } from 'react'
import GroupListBlock from '../components/GroupDir/GroupListBlock'
import { Box } from '@mui/material'

const GroupDirectoryPage: React.FC = () => {
    const [myManagingchannels, setMyManagingChannels] = useState<IChannel[]>([])
    const [myParticipatingChannels, setMyParticipatingChannels] = useState<IChannel[]>([])
    
    
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
            />
            <GroupListBlock
                headerName="Group I am participating in"
                id="participating"
            />
        </Box>
    )
}

export default GroupDirectoryPage;
