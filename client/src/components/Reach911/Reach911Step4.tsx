import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import request from '../../utils/request';
import ChatRoomPage from '../../pages/ChatRoomPage';
import { useLocation, useNavigate } from 'react-router-dom';
import type IIncident from '@/models/Incident';
import type IChannel from '@/models/Channel';

const Reach911Step4: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [channelId, setChannelId] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
  
    useEffect(() =>{
        const setupIncidentChat = async () => {
            try{
                const username = localStorage.getItem('username');
                const uid = localStorage.getItem('uid');
                console.log('Debug - User info:', { username, uid });

                if(!username || !uid) {
                    throw new Error('User is not logged in');
                }

                // First check if user has active incident with chat
                const incidentResponse = await fetch(
                    `${process.env.REACT_APP_BACKEND_URL}/api/incidents/${username}/active`
                );
                const incident: IIncident = await incidentResponse.json();

                if (incident.incidentCallGroup) {
                    // User already has an active incident with chat
                    setChannelId(incident.incidentCallGroup);
                    navigate(`/messages/${incident.incidentCallGroup}`, {
                        replace: true,
                        state: {from: location}
                    });
                } else {
                    // Create a new Channel using request utility
                    const channel: IChannel = await request('/api/channels', {
                        method: 'POST',
                        body: JSON.stringify({
                            name: `I${username}_911`,
                            users: [uid],
                            description: `911 Emergency Call Channel for ${username}`,
                            owner: uid,
                            closed: false
                        })
                    });

                    if (channel && channel._id) {
                        // Update incident with new channel
                        await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/incidents/${incident._id}/chat-group`, {
                            method: 'PUT',
                            body: JSON.stringify({
                                channelId: channel._id
                            }),
                        });

                        setChannelId(channel._id);
                        navigate(`/messages/${channel._id}`, {
                            replace: true,
                            state: {from: location},
                        });
                    }
                }
            } catch (error) {
                console.error('Error in setupIncidentChat:', error); // Debug log
                setError('Failed to setup incident chat');
            } finally {
                setLoading(false);
            }
        };

        setupIncidentChat();
    }, [navigate, location]);

    if (loading) {
        return (
          <Box display="flex" justifyContent="center" alignItems="center" p={3}>
            <CircularProgress />
          </Box>
        );
      }
    
      if (error) {
        return (
          <Box display="flex" justifyContent="center" alignItems="center" p={3}>
            <Typography color="error">{error}</Typography>
          </Box>
        );
      }
    
      if (!channelId) {
        return null;
      }
    
      return (
        <Box sx={{ height: '600px', width: '100%' }}>
          <ChatRoomPage />
        </Box>
      );
}

export default Reach911Step4;