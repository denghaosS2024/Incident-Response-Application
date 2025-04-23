import {
    Box,
    Typography,
    Divider,
    List,
    ListItem,
    ListItemText,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import request from '../utils/request'

const ExerciseDetailPage: React.FC = () => {
    const { id } = useParams()
    const [exercise, setExercise] = useState<any>(null)

    useEffect(() => {
        if (!id) return

        const fetchExercise = async () => {
            try {
                const res = await request(`/api/exercises/${id}`)
                setExercise(res)
            } catch (err) {
                console.error('Failed to fetch exercise:', err)
            }
        }

        fetchExercise()
    }, [id])

    if (!exercise) {
        return <Typography sx={{ padding: 3 }}>Loading...</Typography>
    }

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                {exercise.name}
            </Typography>

            <Typography variant="body1">
                <strong>Condition:</strong> {exercise.condition}
            </Typography>
            <Typography variant="body1">
                <strong>Recovery:</strong> {exercise.recoveryStage}
            </Typography>
            <Typography variant="body1" gutterBottom>
                <strong>Body Region:</strong> {exercise.bodyRegion}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
                Instructions
            </Typography>

            <List>
                {(exercise.blocks || []).map((block: any, idx: number) => (
                    <ListItem
                        key={idx}
                        sx={{
                            border: '1px solid #ccc',
                            borderRadius: 2,
                            mb: 2,
                            padding: 2,
                            alignItems: 'flex-start',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                        }}
                    >
                        <ListItemText primary={block.guide} />
                        {block.videoUrl && (
                            <video
                                src={block.videoUrl}
                                controls
                                style={{ width: '100%', maxWidth: '400px', borderRadius: 8 }}
                            />
                        )}
                    </ListItem>
                ))}
            </List>
        </Box>
    )
}

export default ExerciseDetailPage
