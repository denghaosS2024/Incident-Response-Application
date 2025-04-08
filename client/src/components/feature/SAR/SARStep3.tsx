import { NavigateNext as Arrow } from "@mui/icons-material";
import CheckCircleIcon from "@mui/icons-material/Home";
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import IIncident, { ISarTask } from "../../../models/Incident";
import { RootState } from "../../../redux/store";
import request from "../../../utils/request";

interface ISarTaskWithIndex extends ISarTask {
  taskIndex: number;
}

interface TaskStatsProps {
  incidentId: string;
}

const SARStep3: React.FC<TaskStatsProps> = () => {
  const [tasks, setTasks] = useState<ISarTaskWithIndex[]>([]);
  const incident: IIncident = useSelector(
    (state: RootState) => state.incidentState.incident,
  );

  const fetchDoneTasks = async () => {
    try {
      const incidentDoc = await request(
        `/api/incidents?incidentId=${incident.incidentId}`,
        { method: "GET" },
      );

      if (incidentDoc && incidentDoc[0].sarTasks) {
        const filteredTasks = incidentDoc[0].sarTasks
          .map((task: ISarTask, index: number) => ({
            ...task,
            taskIndex: index, // Store index within array
          }))
          .filter((task: ISarTask) => task.state === "Done");

        setTasks(filteredTasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchDoneTasks();
  }, [incident.incidentId]);

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4, p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
        Completed Tasks
      </Typography>
      {tasks.length > 0 ? (
        <List>
          {tasks.map((task) => (
            <ListItem
              key={task.taskIndex} // Use taskIndex instead of _id
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #ddd",
                padding: "10px",
                border: "1.5px solid #ddd",
                borderRadius: "8px",
                "&:hover": { backgroundColor: "#f5f5f5" },
              }}
            >
              {/* Left side: Icon and task location */}
              <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
                <ListItemAvatar>
                  <CheckCircleIcon
                    style={{ color: "#4caf50", marginLeft: "10" }}
                  />
                </ListItemAvatar>
                <ListItemText primary={task.location ?? "No address"} />
              </Box>

              {/* Right side: Link with arrow icon */}
              <a
                href={`/sar-task/${incident.incidentId}?taskId=${task.taskIndex}`}
                style={{ textDecoration: "none" }}
              >
                <IconButton edge="end" size="large">
                  <Arrow />
                </IconButton>
              </a>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography sx={{ textAlign: "center", color: "gray" }}>
          No tasks available.
        </Typography>
      )}
    </Box>
  );
};

export default SARStep3;
