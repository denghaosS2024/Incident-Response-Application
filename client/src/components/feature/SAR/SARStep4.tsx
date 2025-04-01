import { Box, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Cell, Legend, Pie, PieChart, Tooltip } from 'recharts';
import IIncident, { ISarTask } from '../../../models/Incident';

import { RootState } from '../../../redux/store';
import request from '../../../utils/request';

interface TaskStatsProps {
  incidentId: string;
}

const SARStep4: React.FC<TaskStatsProps> = () => {
  const [todoCount, setTodoCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [averageTaskTime, setAverageTaskTime] = useState(0);
  const [victimStats, setVictimStats] = useState({
    totalVictims: 0,
    Immediate: 0,
    Urgent: 0,
    CouldWait: 0,
    Dismiss: 0,
    Deceased: 0,
  });
  const [hazardStats, setHazardStats] = useState({
    totalHazards: 0,
    "Active Electric Wire": 0, // Match exact naming
    Dogs: 0,
    Explosives: 0,
    Fire: 0,
    Flood: 0,
    Gas: 0,
    Rats: 0,
    Other: 0, // Rename "Others" to "Other" to match the logic in fetchHazardStats
  });
  
    const incident: IIncident = useSelector(
      (state: RootState) => state.incidentState.incident,
    )
  const fetchTaskCounts = async () => {
    try {
        // Fetch all tasks related to the incident
        const incidentDoc = await request(`/api/incidents?incidentId=${incident.incidentId}`, { method: 'GET' });

        if (incidentDoc && incidentDoc[0]?.sarTasks) {
            const tasks = incidentDoc[0].sarTasks;

            // Categorize tasks
            const todoTasks = tasks.filter((task: ISarTask) => task.state === 'Todo');
            const inProgressTasks = tasks.filter((task: ISarTask) => task.state === 'InProgress');
            const doneTasks = tasks.filter((task: ISarTask) => task.state === 'Done');

            // Update state with task counts
            setTodoCount(todoTasks.length);
            setInProgressCount(inProgressTasks.length);
            setDoneCount(doneTasks.length);

            // Calculate total time spent on completed tasks
            let totalHoursSpent = 0;
            doneTasks.forEach((task: ISarTask) => {
                if (task.startDate) {
                    const openingDate = new Date(task.startDate);
                    const closingDate = task.endDate ? new Date(task.endDate) : new Date(); // Use current date if missing
                    totalHoursSpent += (closingDate.getTime() - openingDate.getTime()) / (1000 * 60 * 60); // Convert ms to hours
                }
            });

            // Set average task completion time
            setAverageTaskTime(parseFloat(doneTasks.length > 0 ? (totalHoursSpent / doneTasks.length).toFixed(2) : '0'));
        }
    } catch (error) {
        console.error('Error fetching task counts:', error);
    }
};


const fetchVictimStats = async () => {
  try {
      const incidentDoc = await request(`/api/incidents?incidentId=${incident.incidentId}`, { method: 'GET' });

      if (!incidentDoc || incidentDoc.length === 0 || !incidentDoc[0].sarTasks) {
          console.error('No incident data or SAR tasks found.');
          return;
      }
      const sarTasks = incidentDoc[0].sarTasks
      
      let totalVictims = 0;
      const counts = { Immediate: 0, Urgent: 0, CouldWait: 0, Dismiss: 0, Deceased: 0 };

      sarTasks.forEach((task: ISarTask) => {
          if (Array.isArray(task.victims) && task.victims.length === 5) {
              counts.Immediate += task.victims[0] || 0;
              counts.Urgent += task.victims[1] || 0;
              counts.CouldWait += task.victims[2] || 0;
              counts.Dismiss += task.victims[3] || 0;
              counts.Deceased += task.victims[4] || 0;

              totalVictims += task.victims.reduce((sum, count) => sum + (count || 0), 0);
          }
      });

      setVictimStats({ totalVictims, ...counts });
    } catch (error) {
      console.error('Error fetching victim stats:', error);
  }
};

const fetchHazardStats = async () => {
  try {
    const incidentDoc = await request(`/api/incidents?incidentId=${incident.incidentId}`, { method: 'GET' });

    if (!incidentDoc || incidentDoc.length === 0 || !incidentDoc[0].sarTasks) {
        console.error('No incident data or SAR tasks found.');
        return;
    }
    const tasks = incidentDoc[0].sarTasks

    let totalHazards = 0;
    const hazardCounts: { [key in HazardType]: number } = {
      "Active Electric Wire": 0,
      Dogs: 0,
      Explosives: 0,
      Fire: 0,
      Flood: 0,
      Gas: 0,
      Rats: 0,
      Other: 0,
    };

    type HazardType = "Active Electric Wire" | "Dogs" | "Explosives" | "Fire" | "Flood" | "Gas" | "Rats" | "Other";

    tasks.forEach((task: any) => {
      if (task.hazards) {
        task.hazards.forEach((hazard: string) => {
          // Use a type assertion to safely index into hazardCounts
          if (hazardCounts[hazard as HazardType] !== undefined) {
            hazardCounts[hazard as HazardType] += 1;
          } else {
            hazardCounts["Other"] += 1; // For unrecognized hazards
          }
          totalHazards += 1;
        });
      }
    });

    // Merge updated counts with the previous state
    setHazardStats(prevState => ({
      ...prevState,
      totalHazards,
      ...hazardCounts,
    }));

  } catch (error) {
    console.error('Error fetching hazard stats:', error);
  }
};
  
  const fetchIncidentById = async () => {
    if (!incident) return;
  
    try {
      const incidentDoc = await request(`/api/incidents?incidentId=${incident.incidentId}`, { method: 'GET' });

      if (!incidentDoc || incidentDoc.length === 0) {
          console.error('No incident data found.');
          return;
      }

      console.log("Incident Data:", incidentDoc);

      const incidentData = Array.isArray(incidentDoc) ? incidentDoc[0] : incidentDoc;
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
    fetchVictimStats();
    fetchHazardStats();
  }, [incident]);

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
      <Box sx={{border: 'solid', margin: 'auto'}}>
      {/* Pie chart */}
      <PieChart width={300} height={300} style={{margin: 'auto'}}>
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
      <Box sx={{ mt: 4, border: 'solid'}}>
        <Typography variant="h6" sx={{backgroundColor: 'lightgrey'}}>  Total Victims: {victimStats.totalVictims}
        </Typography>
        <Typography>Immediate: {victimStats.Immediate}</Typography>
        <Typography>Urgent: {victimStats.Urgent}</Typography>
        <Typography>Could Wait: {victimStats.CouldWait}</Typography>
        <Typography>Dismiss: {victimStats.Dismiss}</Typography>
        <Typography>Deceased: {victimStats.Deceased}</Typography>
      </Box>
      <Box sx={{ mt: 4, border: 'solid' }}>
      <Typography variant="h6" sx={{ backgroundColor: 'lightgrey' }}>
        Total Hazards: {hazardStats.totalHazards}
      </Typography>
      <Typography>Active Electric Wire: {hazardStats['Active Electric Wire']}</Typography>
      <Typography>Dogs: {hazardStats.Dogs}</Typography>
      <Typography>Explosives: {hazardStats.Explosives}</Typography>
      <Typography>Fire: {hazardStats.Fire}</Typography>
      <Typography>Flood: {hazardStats.Flood}</Typography>
      <Typography>Gas: {hazardStats.Gas}</Typography>
      <Typography>Rats: {hazardStats.Rats}</Typography>
      <Typography>Others: {hazardStats.Other}</Typography>
    </Box>

    </Box>
  );
};

export default SARStep4
