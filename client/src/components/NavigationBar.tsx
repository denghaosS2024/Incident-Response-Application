import IHospital from "@/models/Hospital";
import { fetchAndSetHospital } from "@/redux/hospitalSlice";
import { AppDispatch } from "@/redux/store";
import { ArrowBack, MoreVert as More } from "@mui/icons-material";
import {
  AppBar,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";
import request from "../utils/request";

export interface IProps {
  /**
   * Whether to show the back button
   */
  showBackButton?: boolean;
  /**
   * Function to be called when the back button is clicked
   */
  onBack?: () => void;
  /**
   * Whether to show the menu button
   */
  showMenu?: boolean;
}

const NavigationBar: FunctionComponent<IProps> = ({
  showBackButton,
  onBack,
  showMenu,
}) => {
  const [openMenu, setOpenMenu] = useState(false);
  const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { hospitalId } = useParams<{ hospitalId?: string }>();

  const [URLSearchParams] = useSearchParams();
  const name = URLSearchParams.get("name");
  const role = localStorage.getItem("role") ?? "Citizen";

  const onBackHandler = onBack || (() => navigate(-1));

  const pathname = location.pathname;

  const hospitalFromSlice: IHospital = useSelector(
    (state: any) => state.hospital.hospitalData,
  );

  // Get the hospital name to include it in the page title
  useEffect(() => {
    if (
      !pathname.startsWith("/register-hospital") ||
      !pathname.endsWith("resources")
    ) {
      return;
    }
    if (hospitalFromSlice?.hospitalName != null) {
      return;
    }
    const getHospital = async () => {
      if (hospitalId) {
        dispatch(fetchAndSetHospital(hospitalId));
      }
    };
    getHospital();
  }, [hospitalId]);

  console.log(hospitalFromSlice);

  // Add "/organization" here to display "Organization"
  const pageTitles: Record<string, string> = {
    "/messages": "Messages",
    "/contacts": "Contacts",
    "/groups": "Groups",
    "/reach911": "911 Call",
    "/incidents": "Incidents",
    "/patients/first-responder": "Patient",
    "/patients/nurse": "Patient",
    "/patient-visit": "Patient Visit",
    "/organization": "Organization",
    "/organization/view": "Organization",
    "/map": "Map",
    "/register-hospital": "Hospital",
    "/hospitals": "Hospitals",
    "/resources": "Resources",
    "/find-hospital": "Find Hospital",
    "/dashboard": "Dashboard",
    "/sar-incident": "SAR Incident",
    "/defaulttruckinventory": "Default Truck Inventory",
    "/defaulttruckadditem": "Add Truck Item",
    "/register-hospital/resources/directory": "Hospital Resources",
  };

  const roleTitles: Record<string, string> = {
    Citizen: "IR Citizen",
    Dispatch: "IR Dispatch",
    Police: "IR Police",
    Fire: "IR Fire",
    Nurse: "IR Nurse",
    "City Director": "IR City Director",
    "Police Chief": "IR Police Chief",
    "Fire Chief": "IR Fire Chief",
  };

  let title = pageTitles[pathname] || "Incident Response";

  // If user is Fire or Police and path is /reach911, override title to "Incidents"

  if (pathname.startsWith("/truck-inventory/")) {
    const truckName = pathname.split("/")[2];
    title = `Truck ${truckName} Inventory`;
  }

  if (
    pathname.startsWith("/register-hospital/") &&
    pathname.endsWith("/requests")
  ) {
    title = "Manage Hospital Requests";
  } else if (pathname.startsWith("/register-hospital/")) {
    title = "Hospital";
  }

  if (
    pathname === "/reach911" &&
    (role === "Fire" || role === "Police" || role === "Dispatch")
  ) {
    title = "Incidents";
  }
  if (pathname === "/incidents/report") {
    title = "Incident Report";
  }

  if (pathname.startsWith("/sar-task")) {
    title = "SAR Task";
  }

  if (pathname.startsWith("/messages/") && name) {
    title = `${name} Messages`;
  }
  if (pathname.startsWith("/profile")) {
    title = "Profile";
  }

  if (pathname.startsWith("/map")) {
    title = "Map";
  }

  if (pathname.startsWith("/groups/")) {
    title = "Group";
  }

  if (pathname === "/") {
    title = roleTitles[role] || "IR Citizen";
  }

  if (pathname.startsWith("/missing-person/report/")) {
    title = name
      ? `${name} Missing Report Overview`
      : "Missing Report Overview";
  }

  if (pathname.startsWith("/missing-person/followUp/")) {
    title = name ? `${name} Follow-Up Information` : "Follow-Up Information";
  }

  if (pathname === "/register-hospital/resources/directory") {
    title = "Hospital Resources";
  }

  if (
    pathname.startsWith("/register-hospital") &&
    pathname.includes("resources/newResource")
  ) {
    title = "Hospital Resource";
  }

  if (
    pathname.startsWith("/register-hospital") &&
    pathname.endsWith("resources")
  ) {
    title = hospitalFromSlice?.hospitalName
      ? `${hospitalFromSlice?.hospitalName} Resources`
      : "Hospital Resources";
  }

  // override for Medical Report page
  if (pathname.startsWith("/patients/report") && name) {
    title = `${name} Medical Report`;
  }

  const openMenuHandler = (anchor: HTMLElement) => {
    setOpenMenu(true);
    setMenuAnchor(anchor);
  };

  const closeMenu = () => {
    setOpenMenu(false);
  };

  const quit = async () => {
    console.log("Logout clicked");
    try {
      const username = localStorage.getItem("username");
      const role = localStorage.getItem("role");

      // Make a POST request to the logout endpoint
      const response = await request("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, role }),
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Handle error (e.g., show a notification)
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("uid");
      localStorage.removeItem("incidentState");
      localStorage.removeItem("911Step");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      localStorage.clear();
      navigate("/login");
    }
  };

  const profile = () => {
    const userId =
      localStorage.getItem("userId") ?? localStorage.getItem("uid");
    if (userId) {
      navigate(`/profile/${userId}`);
    } else {
      console.error("User ID not found in localStorage");
    }
  };

  const hospitalsDirectory = () => {
    navigate("/hospitals");
  };

  const hospitalResources = () => {
    navigate("/register-hospital/resources/directory");
  };

  const findHospital = () => {
    navigate("/find-hospital");
  };

  const navigateToOrganization = () => {
    // Get the user's role from localStorage
    const userRole = localStorage.getItem("role") ?? "";

    // Use the same role-based logic
    if (["Dispatch", "Police", "Fire"].includes(userRole)) {
      // Responders see the ViewOrganization component
      navigate("/organization/view");
    } else {
      // Administrators see the Organization component
      navigate("/organization");
    }

    // Close the menu after navigation
    closeMenu();
  };

  const navigateToDashboard = () => {
    if (["Dispatch", "Police", "Fire"].includes(role)) {
      navigate("/dashboard");
    }
    closeMenu();
  };

  const navigateToResource = () => {
    if (["Police", "Fire"].includes(role)) {
      navigate("/resources");
    }
    closeMenu();
  };

  const navigateToPatientsPage = () => {
    if (["Fire", "Police", "Nurse"].includes(role)) {
      navigate("patients");
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {showBackButton && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={onBackHandler}
            size="large"
          >
            <ArrowBack />
          </IconButton>
        )}
        <Typography style={{ flex: 1 }} variant="h6" color="inherit">
          {title}
        </Typography>
        {showMenu && (
          <IconButton
            color="inherit"
            edge="end"
            onClick={(e) => openMenuHandler(e.currentTarget)}
            size="large"
          >
            <More />
          </IconButton>
        )}
        <Menu open={openMenu} anchorEl={menuAnchor} onClose={closeMenu}>
          {(role === "Dispatch" ||
            role === "Police" ||
            role === "Fire" ||
            role === "Administrator") && (
            <MenuItem onClick={navigateToOrganization}>Organization</MenuItem>
          )}

          {(role === "Nurse" || role === "Police" || role === "Fire") && (
            <MenuItem onClick={hospitalsDirectory}>Hospital Directory</MenuItem>
          )}
          {role === "Nurse" && (
            <MenuItem onClick={hospitalResources}>Hospital Resources</MenuItem>
          )}
          {(role === "Police" || role === "Fire") && (
            <MenuItem onClick={findHospital}>Find Hospital</MenuItem>
          )}
          {(role === "Dispatch" || role === "Police" || role === "Fire") && (
            <MenuItem onClick={navigateToDashboard}>Dashboard</MenuItem>
          )}
          {(role === "Fire" || role === "Police") && (
            <MenuItem onClick={navigateToResource}>
              Resource Allocation
            </MenuItem>
          )}
          {(role === "Fire" || role === "Police" || role === "Nurse") && (
            <MenuItem onClick={navigateToPatientsPage}>Patients</MenuItem>
          )}
          <MenuItem onClick={profile}>Profile</MenuItem>
          <MenuItem onClick={quit}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;
