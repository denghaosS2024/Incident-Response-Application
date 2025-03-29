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

const PatientProfile: React.FC = () => {
    const { patientId } = useParams()
    const navigate = useNavigate()

    const [patient, setPatient] = useState<PatientData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchPatient = async () => {
            if (!patientId) {
                setError('No patientId provided')
                setLoading(false)
                return
            }
            try {
                setLoading(true)
                // 假设你想调用 /api/patients/single?patientId=xxx
                const res = await request(
                    `/api/patients/single?patientId=${patientId}`,
                )
                setPatient(res)
            } catch (err: any) {
                setError(err.message || 'Failed to fetch patient data')
            } finally {
                setLoading(false)
            }
        }

        fetchPatient()
    }, [patientId])

    if (loading) {
        return <div>Loading patient info...</div>
    }

    if (error) {
        return (
            <div>
                <p style={{ color: 'red' }}>{error}</p>
                <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        )
    }

    if (!patient) {
        return (
            <div>
                <p>Patient not found.</p>
                <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
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

                    <Button variant="outlined" onClick={() => navigate(-1)}>
                        Back
                    </Button>
                </CardContent>
            </Card>
        </Box>
    )
}

export default PatientProfile
