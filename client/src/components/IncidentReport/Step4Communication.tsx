import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import LocalPoliceIcon from '@mui/icons-material/LocalPolice'
import MedicalServicesIcon from '@mui/icons-material/MedicalServices'
import { Box, CircularProgress, Paper, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import type IIncident from '../../models/Incident'
import StepIndicator from '../common/StepIndicator'

interface Step4CommunicationProps {
    incidentData: IIncident
}

interface Message {
    _id: string
    content: string
    sender: string // ObjectId
    timestamp: string
    senderName?: string
    senderRole?: string
}

const Step4Communication: React.FC<Step4CommunicationProps> = ({
    incidentData,
}) => {
    const [callerGroupMessages, setCallerGroupMessages] = useState<Message[]>(
        [],
    )
    const [responderGroupMessages, setResponderGroupMessages] = useState<
        Message[]
    >([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchMessagesWithSenders = async () => {
            if (!incidentData.incidentCallGroup) {
                return
            }

            setLoading(true)
            setError(null)

            try {
                const callerGroupId = incidentData.incidentCallGroup
                const callerResponse = await fetch(
                    `/api/channels/${callerGroupId}/messages`,
                )

                if (!callerResponse.ok) {
                    throw new Error(
                        `Failed to fetch caller messages: ${callerResponse.status}`,
                    )
                }

                const callerMessages: Message[] = await callerResponse.json()

                const messagesWithSenders = await Promise.all(
                    callerMessages.map(async (message) => {
                        try {
                            const userResponse = await fetch(
                                `/api/users/${message.sender}`,
                            )

                            if (userResponse.ok) {
                                const userData = await userResponse.json()
                                return {
                                    ...message,
                                    senderName: userData.username,
                                    senderRole: userData.role,
                                }
                            }
                            return message
                        } catch (error) {
                            console.warn(
                                `Error fetching user info for ${message.sender}`,
                                error,
                            )
                            return message
                        }
                    }),
                )

                setCallerGroupMessages(messagesWithSenders)

                if (incidentData.respondersGroup) {
                    const responderGroupId = incidentData.respondersGroup
                    const responderResponse = await fetch(
                        `/api/channels/${responderGroupId}/messages`,
                    )

                    if (responderResponse.ok) {
                        const responderMessages: Message[] =
                            await responderResponse.json()

                        const responderMessagesWithSenders = await Promise.all(
                            responderMessages.map(async (message) => {
                                try {
                                    const userResponse = await fetch(
                                        `/api/users/${message.sender}`,
                                    )

                                    if (userResponse.ok) {
                                        const userData =
                                            await userResponse.json()
                                        return {
                                            ...message,
                                            senderName: userData.username,
                                            senderRole: userData.role,
                                        }
                                    }
                                    return message
                                } catch (error) {
                                    console.warn(
                                        `Error fetching user info for ${message.sender}`,
                                        error,
                                    )
                                    return message
                                }
                            }),
                        )

                        setResponderGroupMessages(responderMessagesWithSenders)
                    }
                }
            } catch (err) {
                console.error('Error fetching messages:', err)
                setError('Failed to load communication messages')
            } finally {
                setLoading(false)
            }
        }

        fetchMessagesWithSenders()
    }, [incidentData.incidentCallGroup, incidentData.respondersGroup])

    const getAllMessages = () => {
        const allMessages = [...callerGroupMessages, ...responderGroupMessages]
        return allMessages.sort(
            (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime(),
        )
    }

    const getMessageIcon = (message: Message) => {
        const role = message.senderRole || ''
        const name = message.senderName || ''

        if (role.includes('fire') || name.toLowerCase().includes('fire')) {
            return <LocalFireDepartmentIcon color="error" />
        } else if (
            role.includes('medical') ||
            name.toLowerCase().includes('medical')
        ) {
            return <MedicalServicesIcon color="primary" />
        } else if (
            role.includes('police') ||
            name.toLowerCase().includes('police')
        ) {
            return <LocalPoliceIcon color="info" />
        } else if (
            role.includes('dispatch') ||
            name.toLowerCase().includes('dispatch') ||
            name.toLowerCase().includes('911')
        ) {
            return (
                <span style={{ fontWeight: 'bold', color: '#d32f2f' }}>
                    911
                </span>
            )
        }

        return null
    }

    const getMessageColor = (message: Message) => {
        const name = message.senderName || ''

        if (
            name.toLowerCase().includes('dispatch') ||
            name.toLowerCase().includes('911') ||
            name === incidentData.caller
        ) {
            return '#ffebee'
        }

        return 'white'
    }

    const formatTimestamp = (timestamp: string) => {
        try {
            const date = new Date(timestamp)
            return date
                .toLocaleString(undefined, {
                    month: '2-digit',
                    day: '2-digit',
                    year: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                })
                .replace(',', ' -')
        } catch (error) {
            return timestamp
        }
    }

    if (loading) {
        return (
            <Box
                sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}
            >
                <CircularProgress />
            </Box>
        )
    }

    if (error) {
        return (
            <Box sx={{ mt: 4, mb: 4 }}>
                <Typography color="error">{error}</Typography>
            </Box>
        )
    }

    const messages = getAllMessages()

    return (
        <Box sx={{ mt: 4, mb: 4 }}>
            <StepIndicator currentStep={4} totalSteps={5} />

            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Communication Timeline
            </Typography>

            {messages.length > 0 ? (
                messages.map((message, index) => (
                    <Paper
                        key={message._id || index}
                        elevation={1}
                        sx={{
                            p: 2,
                            mb: 2,
                            bgcolor: getMessageColor(message),
                            borderRadius: 1,
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 0.5,
                            }}
                        >
                            {getMessageIcon(message)}
                            <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                sx={{ ml: getMessageIcon(message) ? 1 : 0 }}
                            >
                                {message.senderName || 'Unknown User'}
                            </Typography>
                        </Box>
                        <Typography variant="body1">
                            {message.content}
                        </Typography>
                        <Typography
                            variant="caption"
                            align="right"
                            component="div"
                            sx={{ mt: 1 }}
                        >
                            {formatTimestamp(message.timestamp)}
                        </Typography>
                    </Paper>
                ))
            ) : (
                <Typography variant="body1" color="text.secondary">
                    No communication messages available for this incident.
                </Typography>
            )}
        </Box>
    )
}

export default Step4Communication
