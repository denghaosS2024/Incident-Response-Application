import { Box, CircularProgress, Paper, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import ChatBox from '../../Chat/ChatBox'

import request from '../../../utils/request'

import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'

import { addMessage, loadMessages } from '../../../redux/messageSlice'

import type IChannel from '../../../models/Channel'
import type IIncident from '../../../models/Incident'
import type { AppDispatch, RootState } from '../../../redux/store'
import ROLES from '@/utils/Roles'
import IUser from '@/models/User'
import { current } from '@reduxjs/toolkit'

interface Reach911Step4Props {
    isCreatedByFirstResponder?: boolean
}

const Reach911Step4: React.FC<Reach911Step4Props> = ({
    isCreatedByFirstResponder,
}) => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [channelId, setChannelId] = useState<string | null>(null)
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch<AppDispatch>()
    const currentUserId = localStorage.getItem('uid') ?? ''
    const currentUserRole = localStorage.getItem('role') ?? ''
    const [chatTitle, setChatTitle] = useState<string>('911 Call')

    const incident: IIncident = useSelector(
        (state: RootState) => state.incidentState.incident,
    )

    const messages =
        useSelector((state: RootState) => state.messageState.messages)[
            channelId ?? ''
        ] || []

    const sendMessage = async (content: string, channelId: string) => {
        const message = await request(`/api/channels/${channelId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ content: content, isAlert: false }),
        })
        dispatch(addMessage(message))
    }

    // If responder clicked the + button and user is Fire/Police, return early and display "There is no 911 Caller involved"
    if (
        isCreatedByFirstResponder &&
        (currentUserRole === 'Fire' || currentUserRole === 'Police')
    ) {
        return (
            <Paper elevation={3} sx={{ p: 2, m: 2 }}>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    p={3}
                >
                    <Typography variant="h6">
                        There is no 911 Caller involved
                    </Typography>
                </Box>
            </Paper>
        )
    }

    useEffect(() => {
        const setupIncidentChat = async () => {
            if (!incident?._id) {
                return
            }
            try {
                const incidentCaller = incident.caller
                const username = localStorage.getItem('username') ?? ''
                const role = localStorage.getItem('role')
                const uid = localStorage.getItem('uid')

                // New incident
                if (!incidentCaller) {
                    incident.caller = username
                    // incident.incidentCallGroup = uid
                }

                if (
                    role === ROLES.FIRE ||
                    role == ROLES.POLICE ||
                    role === ROLES.DISPATCH
                ) {
                    setChatTitle(`I${incidentCaller}_911`)
                }

                // First check if user has active incident with chat
                const activeIncident: IIncident = await request(
                    `/api/incidents/${incidentCaller}/active`,
                    {
                        method: 'GET',
                    },
                )
                console.log('Active Incident:', activeIncident)

                let channel: IChannel | null = null
                if (activeIncident.incidentCallGroup) {
                    // User already has an active incident with chat
                    setChannelId(activeIncident.incidentCallGroup)
                    channel = await request(
                        `/api/channels/${activeIncident.incidentCallGroup}`,
                        {
                            method: 'GET',
                        },
                    )
                    console.log('Existing Channel:', channel) // Debug log
                } else {
                    // The logic here is too complex, needs a proper refactor to simplify and separate citizen from responder
                    try {
                        // Get existing channel by name
                        const channelName = `I${incidentCaller}_911`

                        try {
                            channel = await request(
                                `/api/channels/name/${channelName}`,
                                {
                                    method: 'GET',
                                },
                            )
                        } catch (error) {
                            // Expected for citizen
                        }

                        if (!channel) {
                            // Create a new Channel using request utility
                            channel = IChannel = await request(
                                '/api/channels/911',
                                {
                                    method: 'POST',
                                    body: JSON.stringify({
                                        username,
                                        userId: uid,
                                    }),
                                },
                            )
                            console.log('New Channel:', channel)
                        }

                        // todo: is this required?
                        setChatTitle(`${incidentCaller}_911`)
                    } catch (error) {
                        console.log('Channel creation error:', error)
                        if (!error.message.includes('already exists')) {
                            throw error
                        }
                    }

                    if (channel?._id) {
                        // Update incident with new channel
                        await request(
                            `/api/incidents/${activeIncident._id}/chat-group`,
                            {
                                method: 'PUT',
                                body: JSON.stringify({
                                    channelId: channel._id,
                                }),
                            },
                        )

                        setChannelId(channel._id)
                    }
                }

                // Add dispatcher or responder to channel if not already present
                let users: IUser[] = channel?.users || null

                // todo: remove user system and and its previous messages
                if (!users?.some((user) => user.id === uid)) {
                    let userIds = users?.map((user) => user._id) || []
                    userIds.push(uid)
                    await request(`/api/channels`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            _id: channel?._id,
                            users: userIds,
                        }),
                    })
                }
            } catch (error) {
                console.error('Error in setupIncidentChat:', error)
                setError('Failed to setup incident chat')
            } finally {
                setLoading(false)
            }
        }

        setupIncidentChat()
    }, [navigate, location])

    // Load messages when channelId changes
    useEffect(() => {
        if (channelId) {
            dispatch(loadMessages(channelId))
        }
    }, [channelId, dispatch])

    if (loading) {
        return (
            <Paper elevation={3} sx={{ p: 2, m: 2 }}>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    p={3}
                >
                    <CircularProgress />
                </Box>
            </Paper>
        )
    }

    if (error) {
        return (
            <Paper elevation={3} sx={{ p: 2, m: 2 }}>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    p={3}
                >
                    <Typography color="error">{error}</Typography>
                </Box>
            </Paper>
        )
    }

    if (!channelId) {
        return (
            <Paper elevation={3} sx={{ p: 2, m: 2 }}>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    p={3}
                >
                    <Typography>Initializing chat...</Typography>
                </Box>
            </Paper>
        )
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
                    overflow: 'hidden',
                }}
            >
                <Typography
                    variant="h6"
                    sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}
                >
                    {chatTitle}
                </Typography>
                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    {channelId && (
                        <ChatBox
                            channelId={channelId}
                            messages={messages}
                            currentUserId={currentUserId}
                            currentUserRole={currentUserRole}
                            isLoading={loading}
                            onSendMessage={sendMessage}
                        />
                    )}
                </Box>
            </Box>
        </Paper>
    )
}

export default Reach911Step4
