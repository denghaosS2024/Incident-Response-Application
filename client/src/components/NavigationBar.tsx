import IHospital from "@/models/Hospital";
import { fetchAndSetHospital } from "@/redux/hospitalSlice";
import { AppDispatch, RootState } from "@/redux/store";
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
import { v4 as uuidv4 } from "uuid";
import NavBarHelper, { IPageHook } from "../utils/NavBarHelper";
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

const createMenuItem = (hook: IPageHook) => {
  return (
    <MenuItem onClick={hook.onSelect} key={uuidv4()}>
      {hook.name}
    </MenuItem>
  );
};

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
    (state: RootState) => state.hospital.hospitalData as IHospital,
  );

  // Get the page title
  const title = NavBarHelper.getPageTitle(
    pathname,
    role,
    name,
    hospitalFromSlice?.hospitalName,
  );

  // Get the hospital name to include it in the page title
  useEffect(() => {
    if (!pathname.startsWith("/hospital") || !pathname.endsWith("resources")) {
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

  const exerciseLibrary = () => {
    navigate("/exercise-library");
  };

  const missingPersonsDirectory = () => {
    navigate("/missing-person/directory");
  };

  const hospitalResources = () => {
    navigate("/hospital-resource/directory");
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

  const navigateToFundingCenter = () => {
    if (["Fire Chief", "Police Chief", "City Director"].includes(role)) {
      navigate("/funding-center");
    }
    closeMenu();
  };

  const navigateToAppointment = () => {
    if (role === "Citizen") {
      navigate("/appointment-scheduler");
    }
    closeMenu();
  };

  const navigateToNurseShifts = () => {
    if (role === "Nurse") {
      navigate("/shifts");
    }
    closeMenu();
  };

  const nurseHooks: IPageHook[] = [
    {
      onSelect: hospitalResources,
      name: "Hospital Resources",
    },
    {
      onSelect: exerciseLibrary,
      name: "Exercise Library",
    },
    {
      onSelect: navigateToNurseShifts,
      name: "Nurse Shifts",
    },
  ];
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
          {/* {role === "Nurse" && (
            <MenuItem onClick={hospitalResources}>Hospital Resources</MenuItem>
          )} */}
          {(role === "Police" || role === "Fire") && (
            <MenuItem onClick={findHospital}>Find Hospital</MenuItem>
          )}
          {
            <MenuItem onClick={missingPersonsDirectory}>
              Missing Persons Directory
            </MenuItem>
          }
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
          {(role === "Fire Chief" ||
            role === "Police Chief" ||
            role === "City Director") && (
            <MenuItem onClick={navigateToFundingCenter}>
              Funding Center
            </MenuItem>
          )}
          {/* {role === "Nurse" && (
            <MenuItem onClick={exerciseLibrary}>Exercise Library</MenuItem>
          )} */}
          {role === "Citizen" && (
            <MenuItem onClick={navigateToAppointment}>Appointment</MenuItem>
          )}
          {/* {role === "Nurse" && (
            <MenuItem onClick={navigateToNurseShifts}>Nurse Shifts</MenuItem>
          )} */}

          {/* Nurse-only menu items */}
          {role === "Nurse" && <>{nurseHooks.map(createMenuItem)}</>}

          {/* {role === "Nurse" && {
            ...nurseHooks.map((hook) => (
              <MenuItem onClick={hook.onSelect} key={uuidv4()}>
                {hook.name}
              </MenuItem>
            )),
          }} */}
          <MenuItem onClick={profile}>Profile</MenuItem>
          <MenuItem onClick={quit}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;
