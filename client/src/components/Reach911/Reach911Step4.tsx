import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Paper} from '@mui/material';
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
                const incident: IIncident = await request(`/api/incidents/${username}/active`, {
                    method: 'GET',
                });

                console.log('Debug - Active Incident:', incident);
                
                if (incident.incidentCallGroup && incident.incidentCallGroup !== '') {
                    // User already has an active incident with chat
                    setChannelId(incident.incidentCallGroup);
                    navigate(`/messages/${incident.incidentCallGroup}`, {
                        replace: true,
                        state: {from: location}
                    });
                } else {
                    // Create a new Channel using request utility
                    const channel: IChannel = await request('/api/channels/911', {
                      method: 'POST',
                      body: JSON.stringify({
                          username,
                          userId: uid
                      })
                  });

                    if (channel && channel._id) {
                        // Update incident with new channel
                        await request(`/api/incidents/${incident._id}/chat-group`, {
                            method: 'PUT',
                            body: JSON.stringify({
                                channelId: channel._id
                            })
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
          <Paper elevation={3} sx={{ p: 2, m: 2 }}>
              <Box display="flex" justifyContent="center" alignItems="center" p={3}>
                  <CircularProgress />
              </Box>
          </Paper>
      );
    }

    if (error) {
        return (
            <Paper elevation={3} sx={{ p: 2, m: 2 }}>
                <Box display="flex" justifyContent="center" alignItems="center" p={3}>
                    <Typography color="error">{error}</Typography>
                </Box>
            </Paper>
        );
    }

    if (!channelId) {
        return (
            <Paper elevation={3} sx={{ p: 2, m: 2 }}>
                <Box display="flex" justifyContent="center" alignItems="center" p={3}>
                    <Typography>Initializing chat...</Typography>
                </Box>
            </Paper>
        );
    }
    
    return (
      <Paper elevation={3} sx={{ p: 2, m: 2 }}>
            <Box 
                sx={{ 
                    height: '500px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'background.paper',
                    borderRadius: 1,
                    overflow: 'hidden'
                }}
            >
                <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    911 Chat
                </Typography>
                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    <ChatRoomPage />
                </Box>
            </Box>
        </Paper>
    );
}

export default Reach911Step4;