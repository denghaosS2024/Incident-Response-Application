import { ISarTask } from "@/models/Incident";
import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Cell, Legend, Pie, PieChart, Tooltip } from "recharts";
import request from "../../utils/request";
interface TaskStatsProps {
  incidentId: string;
}

const TaskStats: React.FC<TaskStatsProps> = ({ incidentId }) => {
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
  const fetchTaskCounts = async () => {
    try {
      const todoTasks = await request(`/api/sartasks/todo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ incidentId }),
      }).catch(() => []);
      const inProgressTasks = await request(`/api/sartasks/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ incidentId }),
      }).catch(() => []);
      const doneTasks = await request(`/api/sartasks/done`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ incidentId }),
      }).catch(() => []);

      setTodoCount(todoTasks.length);
      setInProgressCount(inProgressTasks.length);
      setDoneCount(doneTasks.length);
      // Calculate total time spent and average time
      let totalHoursSpent = 0;

      doneTasks.forEach((task: ISarTask) => {
        const openingDate = new Date(task.startDate ?? Date.now());
        const closingDate = new Date(task.endDate ?? Date.now());
        totalHoursSpent +=
          (closingDate.getTime() - openingDate.getTime()) / (1000 * 60 * 60); // Convert ms to hours
        console.log("total hours spent: ", totalHoursSpent);
      });

      setAverageTaskTime(
        parseFloat(
          doneTasks.length > 0
            ? (totalHoursSpent / doneTasks.length).toFixed(2)
            : "0",
        ),
      );
    } catch (error) {
      console.error("Error fetching task counts:", error);
    }
  };

  const fetchVictimStats = async () => {
    try {
      const tasks = await request(`/api/sartasks/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ incidentId }),
      }).catch(() => []);

      let totalVictims = 0;
      const counts = {
        Immediate: 0,
        Urgent: 0,
        CouldWait: 0,
        Dismiss: 0,
        Deceased: 0,
      };

      tasks.forEach((task: ISarTask) => {
        const v = task.victims;
        if (Array.isArray(v) && v.length === 5) {
          counts.Immediate += v[0] || 0;
          counts.Urgent += v[1] || 0;
          counts.CouldWait += v[0] || 0;
          counts.Dismiss += v[3] || 0;
          counts.Deceased += v[4] || 0;
          totalVictims += v.reduce((sum, val) => sum + (val || 0), 0);
        }
      });

      setVictimStats({ totalVictims, ...counts });
    } catch (error) {
      console.error("Error fetching victim stats:", error);
    }
  };
  const fetchHazardStats = async () => {
    try {
      const tasks = await request(`/api/sartasks/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ incidentId }),
      }).catch(() => []);

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

      type HazardType =
        | "Active Electric Wire"
        | "Dogs"
        | "Explosives"
        | "Fire"
        | "Flood"
        | "Gas"
        | "Rats"
        | "Other";

      tasks.forEach((task: ISarTask) => {
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

      setHazardStats({ totalHazards, ...hazardCounts });
    } catch (error) {
      console.error("Error fetching hazard stats:", error);
    }
  };

  const fetchIncidentById = async () => {
    if (!incidentId) return;

    try {
      const incident = await request(
        `/api/incidents?incidentId=${incidentId}`,
        { method: "GET" },
      );

      if (!incident || incident.length === 0) {
        console.error("No incident data found.");
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
      if (incidentState === "Closed" && closingTime) {
        totalHoursSpent = (closingTime - openingTime) / (1000 * 60 * 60); // Convert ms to hours
      } else {
        totalHoursSpent = (currentTime - openingTime) / (1000 * 60 * 60);
      }

      setTotalTimeSpent(parseFloat(totalHoursSpent.toFixed(2)));
    } catch (error) {
      console.error("Error fetching incident by ID:", error);
    }
  };

  useEffect(() => {
    fetchTaskCounts();
    fetchIncidentById();
    fetchVictimStats();
    fetchHazardStats();
  }, [incidentId]);

  const data = [
    { name: "To-Do", value: todoCount },
    { name: "In Progress", value: inProgressCount },
    { name: "Done", value: doneCount },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  return (
    <Box sx={{ textAlign: "center", mt: 4, margin: "auto" }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Task Distribution
      </Typography>

      {/* Display task counts */}
      <Typography variant="h6" sx={{ color: "blue" }}>
        TO-DO: {todoCount}
      </Typography>
      <Typography variant="h6" sx={{ color: "orange" }}>
        IN-PROGRESS: {inProgressCount}
      </Typography>
      <Typography variant="h6" sx={{ color: "green" }}>
        DONE: {doneCount}
      </Typography>
      <Box sx={{ border: "solid" }}>
        {/* Pie chart */}
        <PieChart width={300} height={300}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="value"
            label
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
        <Typography>Total time spent: {totalTimeSpent} hours</Typography>
        <Typography>
          Average task time: {averageTaskTime.toFixed(2)} hours
        </Typography>
      </Box>
      <Box sx={{ mt: 4, border: "solid" }}>
        <Typography variant="h6" sx={{ backgroundColor: "lightgrey" }}>
          Total Victims: {victimStats.totalVictims}
        </Typography>
        <Typography>Immediate: {victimStats.Immediate}</Typography>
        <Typography>Urgent: {victimStats.Urgent}</Typography>
        <Typography>Could Wait: {victimStats.CouldWait}</Typography>
        <Typography>Dismiss: {victimStats.Dismiss}</Typography>
        <Typography>Deceased: {victimStats.Deceased}</Typography>
      </Box>
      <Box sx={{ mt: 4, border: "solid" }}>
        <Typography variant="h6" sx={{ backgroundColor: "lightgrey" }}>
          Total Hazards: {hazardStats.totalHazards}
        </Typography>
        <Typography>
          ActiveWire: {hazardStats["Active Electric Wire"]}
        </Typography>
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

export default TaskStats;
