import { Grid, Box, Typography } from "@mui/material";
import AlertButton from "./AlertButton";
import { RoleType } from "./common/UserBadge";
interface AlertPanelProps {
  role: "Fire" | "Police";
}

const fireAlerts = [
  { label: "VACATE", 
    bgColor: "red", 
    textColor: "white" }, 
  { label: "RESCUE In Progress",
    bgColor: "#ff33cc",
    textColor: "white", }, 
  { label: "ALL CLEAR",
    bgColor: "#00e6e6",
    textColor: "black", }, 
  { label: "LIFE HAZ",
    bgColor: "purple",
    textColor: "white", }, 
  { label: "P.A.R.",
    bgColor: "green",
    textColor: "white", }, 
  { label: "UTILITIES ON",
    bgColor: "yellow",
    textColor: "black", }, 
  { label: "VERT. VENT",
    bgColor: "#0099ff",
    textColor: "white", }, 
  { label: "CROSS VENT",
    bgColor: "lightblue",
    textColor: "black", }, 
  { label: "UTILITIES OFF",
    bgColor: "darkred",
    textColor: "white", }, 
];

const policeAlerts = [
  { label: "VACATE", 
    bgColor: "red", 
    textColor: "white" }, 
  { label: "SUSPECT ON SCENE",
    bgColor: "#ff33cc",
    textColor: "white", }, 
  { label: "ALL CLEAR",
    bgColor: "#00e6e6",
    textColor: "black", }, 
  { label: "LIFE HAZ",
    bgColor: "purple",
    textColor: "white", }, 
  { label: "P.A.R.",
    bgColor: "green",
    textColor: "white", }, 
  { label: "WEAPON",
    bgColor: "yellow",
    textColor: "black", }, 
  { label: "HOLD FIRE",
    bgColor: "#0099ff",
    textColor: "white", }, 
  { label: "USE FORCE",
    bgColor: "lightblue",
    textColor: "black", }, 
  { label: "HOSTAGE",
    bgColor: "darkred",
    textColor: "white", }, 
];

const AlertPanel: React.FC<AlertPanelProps> = ({ role }) => {
  let alerts: { label: string; bgColor: string; textColor: string }[] = [];
  if (role === "Fire") {
    alerts = fireAlerts;
  } else if (role === "Police") {
    alerts = policeAlerts;
  }

  return (
    <Box sx={{backgroundColor: "white", borderRadius: 2, width: "min(100%, 600px)"}}>
      <Grid container rowSpacing={1} columnSpacing={1} sx={{
          maxWidth: "600px", 
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)", 
          gridTemplateRows: "repeat(3, 1fr)", 
        }}>
        {alerts.map((alert) => (
          <Grid item key={alert.label} sx={{ display: "flex" }}>
            <AlertButton label={alert.label} bgColor={alert.bgColor} textColor={alert.textColor} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AlertPanel;