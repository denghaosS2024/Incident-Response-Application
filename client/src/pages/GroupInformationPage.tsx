import React, { useEffect, useState } from 'react';
import IChannel from '../models/Channel';
import { useParams } from 'react-router-dom';
import request from '../utils/request';
import { Box } from '@mui/material';

const GroupInformationPage: React.FC = () => {
    const { id: channelId } = useParams<{ id: string }>();
    const [channel, setChannel] = useState<IChannel | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChannel = async () => {
            try {
                const response = await request(`/api/channels/${channelId}`); // Adjust the endpoint as necessary
                setChannel(response);
            } catch (error) {
                console.error("Error fetching channel:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchChannel();
    }, [channelId]);

    const handleEditToggle = () => {
        setIsEditMode(!isEditMode);
    };

    // Check if the user is the owner
    const isOwner = channel?.owner._id === localStorage.getItem('uid');

    if (loading) {
        return <div>Loading...</div>; // Show loading state
    }

    return (
        <Box sx={{ width: '95%', margin: '0 auto' }}>
            <h1>{channel?.name}</h1>
            <p>Status: {channel?.closed ? "Closed" : "Active"}</p> {/* Show status */}
            <h2>Description:</h2>
            <p>
                {channel?.description ? (
                    channel.description
                ) : (
                    <p style={{ fontStyle: 'italic', color: 'gray' }}>This group does not have a description!</p>
                )}
            </p>
            <h2>Group Members:</h2>
            <ul>
                {channel?.users.map(user => (
                    <li key={user._id}>{user.username}</li> // Assuming each user has a username property
                ))}
            </ul>
            {
                isOwner && (
                    <button onClick={handleEditToggle}>
                        {isEditMode ? "Cancel" : "Edit"}
                    </button>
                )
            }
            {
                isEditMode && (
                    <div>
                        {/* Add your edit form here */}
                        <h2>Edit Channel</h2>
                        {/* Form fields for editing channel details */}
                    </div>
                )
            }

        </Box>
    );
};

export default GroupInformationPage;