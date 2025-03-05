import { useEffect, useState } from 'react'
import IGroup from '@/models/Channel';
import {Channel, IChannelProps} from '../ChannelList';
import request from '@/utils/request';
import { List, ListItem, ListItemText } from '@mui/material';


interface GroupListBlockProps{
    headerName: string;
    id: string

}

const testGroup : IGroup[] = [
    {
        _id: '123',
        name: 'Group 1',
        description: 'Group 1 description',
        owner: {
            _id: '123',
            username: 'Group 1 owner',
            role: 'Admin',
        },
        closed: false,
        users: [
            {
                _id: '1234',
                username: 'Group 1 user 1',
                role: 'Admin',
            },
            {
                _id: '12345',
                username: 'Group 1 user 2',
                role: 'Member',
            },
        ],
    },
    {
        _id: "456",
        name: 'Group 2',
        description: 'Group 2 description',
        owner: {
            _id: '123',
            username: 'Group 2 owner',
            role: 'Admin',
        },
        closed: false,
        users: [
            {
                _id: '1234',
                username: 'Group 2 user 1',
                role: 'Admin',
            },
            {
                _id: '12345',
                username: 'Group 2 user 2',
                role: 'Member',
            },
        ],
    }
]

const GroupListBlock: React.FC<GroupListBlockProps> = ({
    headerName,
    id
}) => {
    const [groups, setGroups] = useState<IGroup[]>([])
    useEffect(() => {
        setGroups(testGroup)
    },[])



    return (
        <div>
            <div className="group-subheader" id={id}>
                <h3>{headerName}</h3>
            </div>
            <List className="group-item">
                {
                    groups.map(group => (
                        <div key={group._id}>
                            <Channel channel={group} />
                        </div>
                    ))
                }
            </List>
        </div>
    )

}

export default GroupListBlock;