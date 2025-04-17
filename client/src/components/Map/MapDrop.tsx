import BlockIcon from "@mui/icons-material/Block";
import CloudIcon from "@mui/icons-material/Cloud";
import FireHydrantAltIcon from "@mui/icons-material/FireHydrantAlt";
import PushPinIcon from "@mui/icons-material/PushPin";
import HomeIcon from "@mui/icons-material/Home";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Paper from "@mui/material/Paper";
import { useState } from "react";

interface MapDropProps {
  onDropPin: () => void;
  onDropRoadblock: () => void;
  onDropFireHydrant: () => void;
  onDropAirQuality: () => void;
  onDropSARTask: () => void;
}

const MapDrop: React.FC<MapDropProps> = ({
  onDropPin,
  onDropRoadblock,
  onDropFireHydrant,
  onDropAirQuality,
  onDropSARTask,
}) => {
  const [value, setValue] = useState(0);
  const currentUserRole = localStorage.getItem("role") ?? "Citizen"; // Get role

  return (
    <Paper
      sx={{
        position: "absolute",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        height: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(_, newValue) => setValue(newValue)}
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Always show Pin */}
        <BottomNavigationAction
          icon={<PushPinIcon />}
          onClick={onDropPin}
          sx={{ alignItems: "center", justifyContent: "center" }}
        />

        {/* Show Roadblock & Fire Hydrant only if NOT a Nurse */}
        {currentUserRole !== "Nurse" && currentUserRole !== "Citizen" && (
          <>
            <BottomNavigationAction
              icon={<BlockIcon />}
              onClick={onDropRoadblock}
              sx={{ alignItems: "center", justifyContent: "center" }}
            />
            <BottomNavigationAction
              icon={<FireHydrantAltIcon />}
              onClick={onDropFireHydrant}
              sx={{ alignItems: "center", justifyContent: "center" }}
            />
          </>
        )}

        {/* Always show Air Quality */}
        <BottomNavigationAction
          icon={<CloudIcon />}
          onClick={onDropAirQuality}
          sx={{ alignItems: "center", justifyContent: "center" }}
        />

        {/* Always show SAR Task */}
        <BottomNavigationAction
          icon={<HomeIcon />}
          onClick={onDropSARTask}
          sx={{ alignItems: "center", justifyContent: "center" }}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default MapDrop;
