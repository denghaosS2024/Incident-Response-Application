import { NavigateNext as Arrow } from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeIcon from '@mui/icons-material/Home';
import { Box, Chip, IconButton, List, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import IIncident, { ISarTask } from '../../../models/Incident';
import { RootState } from '../../../redux/store';
import request from '../../../utils/request';

interface ISarTaskWithIndex extends ISarTask {
  taskIndex: number;
}

interface TaskStatsProps {
  incidentId: string;
}

const getTaskIcon = (status: string) => {
  if (status === 'InProgress') {
    return <HomeIcon style={{ color: '#2196f3' }} />;
  }
  if (status === 'Done') {
    return <CheckCircleIcon style={{ color: '#4caf50' }} />;
  }
  return <HomeIcon style={{ color: '#f44336' }} />;
};

const SARStep2: React.FC<TaskStatsProps> = () => {
  const [tasks, setTasks] = useState<ISarTaskWithIndex[]>([]);
  const incident: IIncident = useSelector((state: RootState) => state.incidentState.incident);

  const fetchTasks = async () => {
    try {
      const response = await request(`/api/incidents/${incident.incidentId}/sar-task`, {
        method: 'GET',
      });

      if (response && Array.isArray(response)) {
        const filtered = response
          .map((task: ISarTask, index: number) => ({
            ...task,
            taskIndex: index,
          }))
          .filter((task: ISarTask) => task.state === 'Todo' || task.state === 'InProgress');

        setTasks(filtered);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    if (incident.incidentId) {
      fetchTasks();
    }
  }, [incident.incidentId]);


  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
        Active Tasks
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
        <Chip icon={<HomeIcon style={{ color: '#f44336' }} />} label="Todo" variant="outlined" />
        <Chip icon={<HomeIcon style={{ color: '#2196f3' }} />} label="In Progress" variant="outlined" />
      </Box>

      {tasks.length > 0 ? (
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
                '&:hover': { backgroundColor: '#f5f5f5' },
              }}
            >
              {/* Left: Icon and task location */}
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                <ListItemAvatar>{getTaskIcon(task.state)}</ListItemAvatar>
                <ListItemText primary={task.location?.trim() ? task.location : 'No address'} />
                </Box>

              {/* Right: link to details */}
              <a href={`/sar-task/${incident.incidentId}?taskId=${task.taskIndex}`} style={{ textDecoration: 'none' }}>
                <IconButton edge="end" size="large">
                  <Arrow />
                </IconButton>
              </a>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography sx={{ textAlign: 'center', color: 'gray' }}>No tasks available.</Typography>
      )}
    </Box>
  );
};

export default SARStep2;
