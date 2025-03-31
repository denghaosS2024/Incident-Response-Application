import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Cell, Legend, Pie, PieChart, Tooltip } from 'recharts';
import request from '../../utils/request';

interface TaskStatsProps {
  incidentId: string;
}

const TaskStats: React.FC<TaskStatsProps> = ({ incidentId }) => {
  const [todoCount, setTodoCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [averageTaskTime, setAverageTaskTime] = useState(0);

  const fetchTaskCounts = async () => {
    try {
      const todoTasks = await request(`/api/sartasks/todo`, { method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        }, body: JSON.stringify({ incidentId }) }).catch(() => []);
      const inProgressTasks = await request(`/api/sartasks/progress`, { method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        }, body: JSON.stringify({ incidentId }) }).catch(() => []);
      const doneTasks = await request(`/api/sartasks/done`, { method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        }, body: JSON.stringify({ incidentId }) }).catch(() => []);

      setTodoCount(todoTasks.length);
      setInProgressCount(inProgressTasks.length);
      setDoneCount(doneTasks.length);
      // Calculate total time spent and average time
      let totalHoursSpent = 0;

      doneTasks.forEach((task: any) => {
        const openingDate = new Date(task.openingDate);
        const closingDate = new Date(task.closingDate);
        totalHoursSpent += (closingDate.getTime() - openingDate.getTime()) / (1000 * 60 * 60); // Convert ms to hours
        console.log("total hours spent: ", totalHoursSpent);
      });

      setAverageTaskTime(parseFloat(doneTasks.length > 0 ? (totalHoursSpent / doneTasks.length).toFixed(2) : '0'));
    } catch (error) {
      console.error('Error fetching task counts:', error);
    }
  };

  const fetchIncidentById = async () => {
    if (!incidentId) return;
  
    try {
      const incident = await request(`/api/incidents?incidentId=${incidentId}`, { method: 'GET' });
  
      if (!incident || incident.length === 0) {
        console.error('No incident data found.');
        return;
      }
  
      console.log("Incident Data:", incident);
  
      const incidentData = Array.isArray(incident) ? incident[0] : incident;
      const { openingDate, closingDate, incidentState } = incidentData;
  
      if (!openingDate) {
        console.error("Missing opening date");
        return;
      }
  
      const openingTime = new Date(openingDate).getTime();
      const closingTime = closingDate ? new Date(closingDate).getTime() : null;
      const currentTime = Date.now();
  
      let totalHoursSpent = 0;
      if (incidentState === 'Closed' && closingTime) {
        totalHoursSpent = (closingTime - openingTime) / (1000 * 60 * 60); // Convert ms to hours
      } else {
        totalHoursSpent = (currentTime - openingTime) / (1000 * 60 * 60);
      }
  
      setTotalTimeSpent(parseFloat(totalHoursSpent.toFixed(2)));
  
    } catch (error) {
      console.error('Error fetching incident by ID:', error);
    }
  };  

  useEffect(() => {
    fetchTaskCounts();
    fetchIncidentById();
  }, [incidentId]);

  const data = [
    { name: 'To-Do', value: todoCount },
    { name: 'In Progress', value: inProgressCount },
    { name: 'Done', value: doneCount },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <Box sx={{ textAlign: 'center', mt: 4, margin: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Task Distribution
      </Typography>

      {/* Display task counts */}
      <Typography variant="h6" sx={{ color: 'blue' }}>
        TO-DO: {todoCount}
      </Typography>
      <Typography variant="h6" sx={{ color: 'orange' }}>
        IN-PROGRESS: {inProgressCount}
      </Typography>
      <Typography variant="h6" sx={{ color: 'green' }}>
        DONE: {doneCount}
      </Typography>
      <Box sx={{border: 'solid'}}>
      {/* Pie chart */}
      <PieChart width={300} height={300}>
        <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
      <Typography>Total time spent: {totalTimeSpent} hours</Typography>
      <Typography>Average task time: {averageTaskTime.toFixed(2)} hours</Typography>
      </Box>
    </Box>
  );
};

export default TaskStats;
