import { NavigateNext as Arrow } from '@mui/icons-material'
import HomeIcon from '@mui/icons-material/Home'
import { Box, IconButton, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import IIncident, { ISarTask } from '../../../models/Incident'

import { RootState } from '../../../redux/store'
import request from '../../../utils/request'

const getTaskIcon = (status: string) => {
  if (status === 'InProgress') {
    return <HomeIcon style={{ color: '#2196f3', marginLeft: '10'}} />;  // Blue icon for InProgress
  }
  return <HomeIcon style={{ color: '#f44336', marginLeft: '10' }} />;  // Red icon for Todo
}

interface TaskStatsProps {
  incidentId: string;
}

const SARStep2: React.FC<TaskStatsProps> = () => {
  const [tasks, setTasks] = useState<ISarTask[]>([])
  const [taskIndices, setTaskIndices] = useState<{ [key: string]: number | null }>({}) // Store task index by _id
  const incident: IIncident = useSelector(
    (state: RootState) => state.incidentState.incident,
  )

  const fetchNotDoneTasks = async () => {
    try {
      const incidentDoc = await request(`/api/incidents?incidentId=${incident.incidentId}`, { method: 'GET' })

      if (incidentDoc && incidentDoc[0].sarTasks) {
        const filteredTasks = incidentDoc[0].sarTasks.filter(
          (task: ISarTask) => task.state === 'InProgress' || task.state === 'Todo'
        )
        setTasks(filteredTasks)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  useEffect(() => {
    fetchNotDoneTasks()
  }, [incident.incidentId])

  const getTaskIndex = async (taskId: string) => {
    try {
      const incidentDoc = await request(`/api/incidents?incidentId=${incident.incidentId}`, { method: 'GET' })
      if (incidentDoc && incidentDoc[0].sarTasks) {
        const taskIndex = incidentDoc[0].sarTasks.findIndex((task: ISarTask) => task._id === taskId)
        return taskIndex !== -1 ? taskIndex : null
      }
    } catch (error) {
      console.error('Error fetching task index:', error)
    }
  }

  useEffect(() => {
    const fetchIndices = async () => {
      const indices: { [key: string]: number | null } = {}
      for (const task of tasks) {
        const index = await getTaskIndex(task._id)
        if (index !== null) {
          indices[task._id] = index
        }
      }
      setTaskIndices(indices)
    }

    if (tasks.length > 0) {
      fetchIndices()
    }
  }, [tasks, incident.incidentId])

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
        Tasks TO-DO and IN-PROGRESS
      </Typography>
      {tasks.length > 0 ? (
        <List>
          {tasks.map((task) => {
            const taskIndex = taskIndices[task._id]
            return (
              <ListItem
                key={task._id} // Use _id as the unique key
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center', // Ensures vertical alignment
                  borderBottom: '1px solid #ddd',
                  padding: '10px',
                  border: '1.5px solid #ddd',
                  borderRadius: '8px',
                  '&:hover': { backgroundColor: '#f5f5f5' },
                }}
              >
                {/* Left side: Image and task name */}
                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                <ListItemAvatar>
                    {getTaskIcon(task.state)}  {/* Display the appropriate icon */}
                  </ListItemAvatar>
                  <ListItemText
                    primary={task.address ? task.address : "No address"} // Display task address or fallback message
                  />
                </Box>

                {/* Right side: Arrow as a Link */}
                {taskIndex !== undefined && taskIndex !== null ? (
                  <a href={`/sar-task/${incident.incidentId}?taskId=${taskIndex}`} style={{ textDecoration: 'none' }}>
                    <IconButton edge="end" size="large">
                      <Arrow />
                    </IconButton>
                  </a>
                ) : null}
              </ListItem>
            )
          })}
        </List>
      ) : (
        <Typography sx={{ textAlign: 'center', color: 'gray' }}>
          No tasks available.
        </Typography>
      )}
    </Box>
  )
}

export default SARStep2
