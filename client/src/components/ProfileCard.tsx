import { Card, CardContent, Typography } from '@mui/material'
import React from 'react'

interface ProfileCardProps {
    title: string
    data: Record<string, string>
}

const ProfileCard: React.FC<ProfileCardProps> = ({ title, data }) => {
    return (
        <Card variant="outlined" sx={{ marginBottom: 2, maxWidth: 600 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {title}
                </Typography>
                {Object.entries(data).map(([key, value]) => (
                    <Typography
                        key={key}
                        variant="body2"
                        color="text.secondary"
                    >
                        <strong>{key}:</strong> {value}
                    </Typography>
                ))}
            </CardContent>
        </Card>
    )
}

export default ProfileCard
