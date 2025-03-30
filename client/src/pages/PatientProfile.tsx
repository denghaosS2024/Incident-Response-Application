import { Box, Button, Card, CardContent, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import request from '../utils/request'

interface PatientData {
    patientId: string
    name: string
    nurseId?: string
    hospitalId?: string
    priority?: string
    status?: string
    location?: string
}

// Helper function to verify that patientId is a valid non-empty string
const isValidPatientId = (id: any): boolean => {
    return typeof id === 'string' && id.trim() !== ''
}

const PatientProfile: React.FC = () => {
    const { patientId } = useParams()
    const navigate = useNavigate()

    const [patient, setPatient] = useState<PatientData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchPatient = async () => {
            // Check if patientId is valid
            if (!isValidPatientId(patientId)) {
                setError(
                    'Invalid or missing patientId. Please check the patient information.',
                )
                setLoading(false)
                return
            }
            try {
                setLoading(true)
                // Call the API to fetch patient data; endpoint assumed as /api/patients/single?patientId=xxx
                const res = await request(
                    `/api/patients/single?patientId=${patientId}`,
                )
                if (!res) {
                    setError(
                        'No patient data found. Please verify the patientId.',
                    )
                } else {
                    setPatient(res)
                }
            } catch (err: any) {
                // Provide a friendly error message if the request fails
                setError(
                    err?.message ||
                        'Failed to fetch patient data. Please try again later.',
                )
            } finally {
                setLoading(false)
            }
        }

        fetchPatient()
    }, [patientId])

    if (loading) {
        return (
            <Box sx={{ padding: 2 }}>
                <Typography variant="h6">Loading patient info...</Typography>
            </Box>
        )
    }

    if (error) {
        return (
            <Box sx={{ padding: 2 }}>
                <Typography variant="h6" color="error" gutterBottom>
                    {error}
                </Typography>
                <Button variant="contained" onClick={() => navigate(-1)}>
                    Go Back
                </Button>
            </Box>
        )
    }

    if (!patient) {
        return (
            <Box sx={{ padding: 2 }}>
                <Typography variant="h6" color="error" gutterBottom>
                    Patient not found.
                </Typography>
                <Button variant="contained" onClick={() => navigate(-1)}>
                    Go Back
                </Button>
            </Box>
        )
    }

    return (
        <Box sx={{ padding: 2 }}>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Patient Profile (Read-only)
                    </Typography>
                    <Typography variant="body1">
                        <strong>Patient ID:</strong> {patient.patientId}
                    </Typography>
                    <Typography variant="body1">
                        <strong>Name:</strong> {patient.name}
                    </Typography>
                    <Typography variant="body1">
                        <strong>Location:</strong> {patient.location || 'N/A'}
                    </Typography>
                    <Typography variant="body1">
                        <strong>Priority:</strong> {patient.priority || 'N/A'}
                    </Typography>
                    <Typography variant="body1">
                        <strong>Status:</strong> {patient.status || 'N/A'}
                    </Typography>
                    <Typography variant="body1">
                        <strong>Hospital ID:</strong>{' '}
                        {patient.hospitalId || 'N/A'}
                    </Typography>
                    <Typography variant="body1">
                        <strong>Nurse ID:</strong> {patient.nurseId || 'N/A'}
                    </Typography>
                    <Box mt={2}>
                        <Button variant="outlined" onClick={() => navigate(-1)}>
                            Go Back
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    )
}

export default PatientProfile
