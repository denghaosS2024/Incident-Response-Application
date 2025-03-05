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
        _id: '67c7b9fd385f83301b5bcb9d',
        name: 'Group 1',
        description: 'Group 1 description',
        owner: {
            _id: '67c7863a0f3c79419dd1f430',
            username: 'Group 1 owner',
            role: 'Admin',
        },
        closed: false,
        users: [
            {
                _id: '67c6d834cf816d70c24f4da9',
                username: 'Group 1 user 1',
                role: 'Admin',
            },
            {
                _id: '67c7863a0f3c79419dd1f430',
                username: 'Group 1 user 2',
                role: 'Member',
            },
        ],
    },
    {
        _id: "67c7863a0f3c79419dd1f430",
        name: 'Group 2',
        description: 'Group 2 description',
        owner: {
            _id: '67c6d834cf816d70c24f4da9',
            username: 'Group 2 owner',
            role: 'Admin',
        },
        closed: false,
        users: [
            {
                _id: '67c6d834cf816d70c24f4da9',
                username: 'Group 2 user 1',
                role: 'Admin',
            },
            {
                _id: '67c7863a0f3c79419dd1f430',
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