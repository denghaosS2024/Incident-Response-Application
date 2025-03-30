import AddIcon from '@mui/icons-material/Add'
import {
    Box,
    Typography
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import IIncident from '../../../models/Incident'
import { loadContacts } from '../../../redux/contactSlice'
import { AppDispatch, RootState } from '../../../redux/store'
import { MedicalQuestions } from '../../../utils/types'
import Loading from '../../common/Loading'

const VisitLogForm: React.FC<{ username?: string }> = ({
    username: propUsername,
}) => {
    const dispatch = useDispatch<AppDispatch>()
    const incident: IIncident = useSelector(
        (state: RootState) => state.incidentState.incident,
    )
    const navigate = useNavigate()
    const medicalQuestions = (incident.questions as MedicalQuestions) ?? {}

    const [usernameError, setUserNameError] = useState<string>('')

    // Loads contacts upon page loading
    useEffect(() => {
        dispatch(loadContacts())
    }, [dispatch])

    const { contacts, loading } = useSelector(
        (state: RootState) => state.contactState,
    )

    // Validates field to set certain error messages
    const validateField = (field: string, value: string | boolean) => {
        if (field === 'username') {
            setUserNameError(
                !value || value === 'Select One' ? 'Select a username' : '',
            )
        }
    }

    if (loading) return <Loading />

    return (
        <>
            <Box
                width="100%"
                maxWidth="800px"
                my={4}
                display="flex"
                flexDirection="column"
                alignItems="left"
                paddingX="32px"
            >
                <Typography variant="h6" gutterBottom>
                    Visit Log
                </Typography>
                <Box
                    sx={{
                        overflowX: 'auto',
                    }}
                >
                    <table
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            textAlign: 'left',
                            border: '1px solid #ddd',
                        }}
                    >
                        <thead>
                            <tr>
                                <th
                                    style={{
                                        border: '1px solid #ddd',
                                        padding: '8px',
                                    }}
                                >
                                    Date
                                </th>
                                <th
                                    style={{
                                        border: '1px solid #ddd',
                                        padding: '8px',
                                    }}
                                >
                                    Location
                                </th>
                                <th
                                    style={{
                                        border: '1px solid #ddd',
                                        padding: '8px',
                                    }}
                                >
                                    Link
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {incident.visits?.map((visit, index) => (
                                <tr key={index}>
                                    <td
                                        style={{
                                            border: '1px solid #ddd',
                                            padding: '8px',
                                        }}
                                    >
                                        {visit.date}
                                    </td>
                                    <td
                                        style={{
                                            border: '1px solid #ddd',
                                            padding: '8px',
                                        }}
                                    >
                                        {visit.location}
                                    </td>
                                    <td
                                        style={{
                                            border: '1px solid #ddd',
                                            padding: '8px',
                                        }}
                                    >
                                        <a
                                            href={visit.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                color: '#1976d2',
                                                textDecoration: 'none',
                                            }}
                                        >
                                            View
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            marginTop: '10px',
                        }}>
                        <AddIcon 
                            style={{ cursor: 'pointer' }}
                        /> 
                    </div>
                </Box>
            </Box>
        </>
    )
}

export default VisitLogForm
