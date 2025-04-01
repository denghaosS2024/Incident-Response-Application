import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import LocalPoliceIcon from '@mui/icons-material/LocalPolice'
import MedicalServicesIcon from '@mui/icons-material/MedicalServices'
import { Box, CircularProgress, Paper, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import type IIncident from '../../models/Incident'
import request from '../../utils/request'
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
    isAlert?: boolean
    messageGroup?: 'caller' | 'responder'
}

const Step4Communication: React.FC<Step4CommunicationProps> = ({
    incidentData,
}) => {
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchMessagesWithSenders = async () => {
            if (
                !incidentData.incidentCallGroup &&
                !incidentData.respondersGroup
            ) {
                return
            }

            setLoading(true)
            setError(null)

            try {
                const allMessages: Message[] = []

                if (incidentData.incidentCallGroup) {
                    console.log(
                        `Fetching messages for group: ${incidentData.incidentCallGroup}`,
                    )

                    try {
                        const callerResponse = await request(
                            `/api/channels/${incidentData.incidentCallGroup}/messages`,
                            {
                                method: 'GET',
                            },
                        )

                        console.log(callerResponse)

                        const callerMessages = Array.isArray(callerResponse)
                            ? callerResponse
                            : []

                        for (const message of callerMessages) {
                            try {
                                allMessages.push({
                                    _id: message._id,
                                    content: message.content,
                                    sender:
                                        message.sender._id || message.sender,
                                    timestamp: message.timestamp,
                                    senderName:
                                        message.sender.username ||
                                        'Unknown User',
                                    senderRole: message.sender.role || '',
                                    messageGroup: 'caller', // Add message group identifier
                                    isAlert: message.isAlert || false,
                                })
                            } catch (error) {
                                console.warn(
                                    `Error processing message data:`,
                                    error,
                                )
                                allMessages.push({
                                    _id: message._id,
                                    content: message.content,
                                    sender:
                                        typeof message.sender === 'object'
                                            ? message.sender._id
                                            : message.sender,
                                    timestamp: message.timestamp,
                                    senderName: 'Unknown User',
                                    senderRole: '',
                                    messageGroup: 'caller', // Add message group identifier
                                })
                            }
                        }
                    } catch (fetchError) {
                        console.error(
                            'Error fetching caller messages:',
                            fetchError,
                        )
                        setError('Failed to load caller messages')
                    }
                }

                if (incidentData.respondersGroup) {
                    console.log(
                        `Fetching messages for responders group: ${incidentData.respondersGroup}`,
                    )

                    try {
                        const respondersResponse = await request(
                            `/api/channels/${incidentData.respondersGroup}/messages`,
                            {
                                method: 'GET',
                            },
                        )

                        const responderMessages = Array.isArray(
                            respondersResponse,
                        )
                            ? respondersResponse
                            : []

                        for (const message of responderMessages) {
                            try {
                                allMessages.push({
                                    _id: message._id,
                                    content: message.content,
                                    sender:
                                        message.sender._id || message.sender,
                                    timestamp: message.timestamp,
                                    senderName:
                                        message.sender.username ||
                                        'Unknown User',
                                    senderRole: message.sender.role || '',
                                    messageGroup: 'responder', // Add message group identifier
                                    isAlert: message.isAlert || false,
                                })
                            } catch (error) {
                                console.warn(
                                    `Error processing responder message data:`,
                                    error,
                                )
                                allMessages.push({
                                    _id: message._id,
                                    content: message.content,
                                    sender:
                                        typeof message.sender === 'object'
                                            ? message.sender._id
                                            : message.sender,
                                    timestamp: message.timestamp,
                                    senderName: 'Unknown User',
                                    senderRole: '',
                                    messageGroup: 'responder', // Add message group identifier
                                })
                            }
                        }
                    } catch (fetchError) {
                        console.error(
                            'Error fetching responder messages:',
                            fetchError,
                        )
                        setError('Failed to load responder messages')
                    }
                }

                allMessages.sort(
                    (a, b) =>
                        new Date(a.timestamp).getTime() -
                        new Date(b.timestamp).getTime(),
                )

                setMessages(allMessages)
            } catch (err) {
                console.error('Error in fetchMessagesWithSenders:', err)
                setError('Failed to load communication messages')
            } finally {
                setLoading(false)
            }
        }

        fetchMessagesWithSenders()
    }, [
        incidentData.incidentCallGroup,
        incidentData.respondersGroup,
        incidentData.caller,
    ])
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
        // First check the message group
        if (message.messageGroup === 'caller') {
            return '#ffebee' // Light pink for caller group
        } else if (message.messageGroup === 'responder') {
            return '#00000' // Light blue for responder group
        }

        // Fallback to using sender name/role if messageGroup is not available
        const name = message.senderName || ''

        if (
            name.toLowerCase().includes('dispatch') ||
            name.toLowerCase().includes('911') ||
            name === incidentData.caller
        ) {
            return '#ffebee' // Light pink
        }

        return 'white'
    }

    // Function to parse alert content and extract colors
    const parseAlertContent = (message: Message) => {
        if (!message.isAlert)
            return { text: '', bgColor: null, textColor: null }

        // Split the content by the first dash
        const parts = message.content.split('-')

        // Get the alert text (before the first dash)
        const text = parts[0]

        // Get the background color (after the first dash)
        const bgColor = parts.length > 1 ? parts[1] : '#00e6e6'

        // Get the text color (after the second dash, default to black)
        const textColor = parts.length > 2 ? parts[2] : 'black'

        console.log(
            `Parsed alert content: text=${text}, bgColor=${bgColor}, textColor=${textColor}`,
        )

        return { text, bgColor, textColor }
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

    if (error && messages.length === 0) {
        return (
            <Box sx={{ mt: 4, mb: 4 }}>
                <Typography color="error">{error}</Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ mt: 4, mb: 4 }}>
            <StepIndicator currentStep={4} totalSteps={5} />

            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                Communication Timeline
            </Typography>

            {messages.length > 0 ? (
                messages.map((message, index) => {
                    // Parse alert content if this is an alert message
                    const { text, bgColor, textColor } = message.isAlert
                        ? parseAlertContent(message)
                        : { text: '', bgColor: null, textColor: null }

                    return (
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

                            {/* For alert messages, show the text part of the content */}
                            <Typography variant="body1">
                                {message.isAlert ? text : message.content}
                            </Typography>

                            {/* Display alert box if it's an alert message */}
                            {message.isAlert && (
                                <Box
                                    sx={{
                                        mt: 2,
                                        display: 'flex',
                                        justifyContent: 'flex-start',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            bgcolor: bgColor,
                                            color: textColor,
                                            py: 2,
                                            px: 4,
                                            borderRadius: 1,
                                            fontWeight: 'bold',
                                            fontSize: '1.1rem',
                                            display: 'inline-block',
                                            minWidth: '150px',
                                            textAlign: 'center',
                                        }}
                                    >
                                        {text}
                                    </Box>
                                </Box>
                            )}

                            <Typography
                                variant="caption"
                                align="right"
                                component="div"
                                sx={{ mt: 1 }}
                            >
                                {formatTimestamp(message.timestamp)}
                            </Typography>
                        </Paper>
                    )
                })
            ) : (
                <Typography variant="body1" color="text.secondary">
                    No communication messages available for this incident.
                </Typography>
            )}
        </Box>
    )
}

export default Step4Communication
