import dayjs, { Dayjs } from 'dayjs'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Badge,
  Button,
} from '@mui/material'

import request from '../utils/request'
import { DateCalendar, PickersDay } from '@mui/x-date-pickers'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

const PlanViewPage: React.FC = () => {
  const navigate = useNavigate()
  const username = localStorage.getItem('username')
  const userId = localStorage.getItem('uid')

  const [patientId, setPatientId] = useState<string | null>(null)
  const [medications, setMedications] = useState<any[]>([])
  const [exercises, setExercises] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs())
  const [exerciseCheckInDates, setExerciseCheckInDates] = useState<Record<string, string[]>>({})

  const fetchCheckIns = async (exerciseList: any[]) => {
    const map: Record<string, string[]> = {}
    await Promise.all(
      exerciseList.map(async (ex) => {
        try {
          const res = await request(`/api/checkin/${userId}/${ex._id}`)
          map[ex._id] = res || []
        } catch (err) {
          console.error(`Failed to fetch check-ins for ${ex._id}`, err)
        }
      })
    )
    setExerciseCheckInDates(map)
  }

  const handleCheckIn = async (exerciseId: string, date: Dayjs) => {
    const today = dayjs().startOf('day')
    if (!date.isSame(today, 'day')) return

    const dateStr = date.format('YYYY-MM-DD')
    const already = exerciseCheckInDates[exerciseId] || []
    if (already.includes(dateStr)) return

    try {
      await request('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, exerciseId, date: dateStr }),
      })

      setExerciseCheckInDates((prev) => ({
        ...prev,
        [exerciseId]: [...(prev[exerciseId] || []), dateStr],
      }))
    } catch (err) {
      console.error('Failed to check in:', err)
    }
  }

  useEffect(() => {
    const fetchPatientAndPlan = async () => {
      if (!username) return
      try {
        const patient = await request(`/api/patientPlan/by-user/${username}`)
        const realPatientId = patient.patientId
        setPatientId(realPatientId)

        const res = await request(`/api/patientPlan/${realPatientId}`)
        setMedications(res.medications || [])
        setExercises(res.exercises || [])
        await fetchCheckIns(res.exercises || [])
      } catch (err) {
        console.error('Failed to fetch patient or plan:', err)
      }
    }

    fetchPatientAndPlan()
  }, [username])

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Medication Plan
      </Typography>
      <List>
        {medications.map((med, idx) => (
          <ListItem key={idx} sx={{ border: '1px solid #ccc', mb: 2, borderRadius: 2 }}>
            <ListItemText
              primary={<Typography fontWeight="bold">{med.name}</Typography>}
              secondary={
                <>
                  <div>Frequency: {med.frequency}</div>
                  <div>Time of Day: {med.time}</div>
                  <div>Route: {med.route}</div>
                  <div>Notes from Nurse: {med.notes}</div>
                </>
              }
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Suggested Exercises
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        {exercises.map((ex: any) => (
          <Paper
            key={ex._id}
            elevation={2}
            sx={{ padding: 2, borderRadius: 2, cursor: 'default', '&:hover': { backgroundColor: '#f1f1f1' } }}

          >
            <Box onClick={() => navigate(`/exercise/${ex._id}`)}>
              <Typography variant="subtitle1" fontWeight="bold">
                {ex.name}
              </Typography>
              <Typography variant="body2">Condition: {ex.condition}</Typography>
              <Typography variant="body2">Recovery Stage: {ex.recoveryStage}</Typography>
              <Typography variant="body2" gutterBottom>Body Region: {ex.bodyRegion}</Typography>
            </Box>
            {ex.blocks?.map((block: any, idx: number) => {
              const url = block.videoUrl
              const isYouTube = url?.includes('youtube.com/watch') || url?.includes('youtu.be')
              let videoContent = null

              if (isYouTube) {
                const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\s&]+)/)
                const videoId = match?.[1]
                if (videoId) {
                  videoContent = (
                    <Box
                      component="iframe"
                      width="100%"
                      height="315"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      sx={{ mt: 1 }}
                    />
                  )
                }
              } else if (url) {
                videoContent = (
                  <video width="100%" height="auto" controls style={{ marginTop: 8 }}>
                    <source src={url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )
              }

              return (
                <Box key={idx} mt={3}>
                  <Typography variant="body2" gutterBottom>
                    {block.guide}
                  </Typography>
                  {videoContent}
                </Box>
              )
            })}

            <Divider sx={{ my: 4 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Self-discipline Check-in
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                value={selectedDate}
                onChange={(newVal) => {
                  if (newVal) setSelectedDate(newVal)
                }}
                onMonthChange={(newMonth) => {
                  if (newMonth) setSelectedDate(newMonth)
                }}
                slots={{
                  day: (props) => {
                    const dateStr = props.day.format('YYYY-MM-DD')
                    const checkedDates = exerciseCheckInDates[ex._id] || []
                    const isChecked = checkedDates.includes(dateStr)

                    return (
                      <Badge
                        key={dateStr}
                        overlap="circular"
                        badgeContent={
                          isChecked ? (
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                backgroundColor: 'red',
                              }}
                            />
                          ) : null
                        }
                      >
                        <PickersDay {...props} />
                      </Badge>
                    )
                  },
                }}
              />
            </LocalizationProvider>


            <Typography variant="body2" color="text.secondary" mt={1}>
              Click **only today** to check in; red dot = completed.
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => handleCheckIn(ex._id, selectedDate)}
            >
              Check-in for Today
            </Button>
          </Paper>
        ))}
      </Box>
    </Box>
  )
}

export default PlanViewPage