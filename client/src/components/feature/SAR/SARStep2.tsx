import Socket from '@/utils/Socket'
import { NavigateNext as Arrow } from '@mui/icons-material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HomeIcon from '@mui/icons-material/Home'
import { Box, Chip, IconButton, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import IIncident, { ISarTask } from '../../../models/Incident'
import { RootState } from '../../../redux/store'
import request from '../../../utils/request'

const getTaskIcon = (status: string) => {
  if (status === 'InProgress') {
    return <HomeIcon style={{ color: '#2196f3', marginLeft: '10'}} />;  // Blue icon for InProgress
  }
  if (status === 'Done') {
    return <CheckCircleIcon style={{ color: '#4caf50', marginLeft: '10'}} />;  // Green icon for Done
  }
  return <HomeIcon style={{ color: '#f44336', marginLeft: '10' }} />;  // Red icon for Todo
}

interface TaskStatsProps {
  incidentId: string;
}
interface ISarTaskWithIndex extends ISarTask {
  taskIndex: number;
}

const SARStep2: React.FC<TaskStatsProps> = () => {
  const [tasks, setTasks] = useState<ISarTaskWithIndex[]>([]);
  const [taskIndices, setTaskIndices] = useState<{ [key: string]: number | null }>({}) // Store task index by _id
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const incident: IIncident = useSelector(
    (state: RootState) => state.incidentState.incident,
  )

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await request(`/api/incidents/${incident.incidentId}/sar-task`, {
        method: 'GET',
      });
      
      if (response && Array.isArray(response)) {
        // Convert the tasks from the backend format to our frontend format
        const processedTasks = response.map((task: any, index: number) => ({
          _id: task._id,
          name: task.name ?? 'Unnamed Task',
          description: task.description ?? '',
          state: task.state ?? 'Todo',
          location: task.location ?? '',
          coordinates: task.coordinates ?? null,
          taskIndex: index,
          hazards: task.hazards ?? [],
          victims: task.victims ?? []
        }));
        
        setTasks(processedTasks);
      } else {
        console.log('No SAR tasks found or invalid response format');
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching SAR tasks:', error);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (incident.incidentId) {
      fetchTasks();
    }
  }, [incident.incidentId]);

  // Handle task click to navigate to task details
  const handleTaskClick = (task: ISarTaskWithIndex) => {
    navigate(`/sar-task/${incident.incidentId}?taskId=${task.taskIndex}`);
  };

  Socket.on('sar-task-update', (data: any) => {
    if (data.incidentId === incident.incidentId) {
      fetchTasks();
    }
  });

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
        SAR Tasks
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
        <Chip 
          icon={<HomeIcon style={{ color: '#f44336' }} />} 
          label="Todo" 
          color="default" 
          variant="outlined" 
        />
        <Chip 
          icon={<HomeIcon style={{ color: '#2196f3' }} />} 
          label="In Progress" 
          color="primary" 
          variant="outlined" 
        />
        <Chip 
          icon={<CheckCircleIcon style={{ color: '#4caf50' }} />} 
          label="Done" 
          color="success" 
          variant="outlined" 
        />
      </Box>
      
      {isLoading ? (
        <Typography sx={{ textAlign: 'center', color: 'gray' }}>
          Loading tasks...
        </Typography>
      ) : tasks.length > 0 ? (
        <List>
          {tasks.map((task) => (
            <ListItem
              key={task.taskIndex}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #ddd',
                padding: '10px',
                border: '1.5px solid #ddd',
                borderRadius: '8px',
                mb: 2,
                backgroundColor:
                  task.state === 'Done'
                    ? 'rgba(76, 175, 80, 0.1)'
                    : task.state === 'InProgress'
                    ? 'rgba(33, 150, 243, 0.1)'
                    : 'white',
                cursor: 'pointer',
                '&:hover': { backgroundColor: '#f5f5f5' },
              }}
              onClick={() => handleTaskClick(task)}
            >
              {/* Left side: Icon and task name */}
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                <ListItemAvatar>
                  {getTaskIcon(task.state)}
                </ListItemAvatar>
                <ListItemText
                  primary={task.name}
                  secondary={task.location ?? "No address"}
                />
              </Box>

              {/* Right side: Status chip and arrow */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={
                    task.state === 'Todo'
                      ? 'To Do'
                      : task.state === 'InProgress'
                      ? 'In Progress'
                      : 'Done'
                  }
                  color={
                    task.state === 'Done'
                      ? 'success'
                      : task.state === 'InProgress'
                      ? 'primary'
                      : 'default'
                  }
                  size="small"
                />
                <IconButton edge="end" size="large">
                  <Arrow />
                </IconButton>
              </Box>
            </ListItem>
          ))}
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
