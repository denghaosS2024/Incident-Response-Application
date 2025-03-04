
import IChannel from '../models/Channel'
import { useState } from 'react'
import GroupListBlock from '../components/GroupDir/GroupListBlock'

const GroupDirectoryPage: React.FC = () => {
    const [myManagingchannels, setMyManagingChannels] = useState<IChannel[]>([])
    const [myParticipatingChannels, setMyParticipatingChannels] = useState<IChannel[]>([])
    
    
    return (
        <div>
            Group Directory
            <GroupListBlock
                headerName="Group I am managing"
                id="managing"
            />
            <GroupListBlock
                headerName="Group I am participating in"
                id="participating"
            />
        </div>
    )
}

export default GroupDirectoryPage;
