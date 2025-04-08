import {
  PermContactCalendar as Contact,
  LocationOn as LocationIcon,
  Message,
} from "@mui/icons-material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import Groups2Icon from "@mui/icons-material/Groups2";
import { Box, Link, List, ListItemText } from "@mui/material";
import { Fragment, FunctionComponent, ReactElement } from "react";
interface ITab {
  text: string;
  link: string;
  icon?: ReactElement;
}

const roleTabs: Record<string, ITab[]> = {
  Citizen: [
    { text: "Messages", link: "/messages", icon: <Message /> },
    { text: "Contacts", link: "/contacts", icon: <Contact /> },
    { text: "Groups", link: "/groups", icon: <Groups2Icon /> },
    { text: "Map", link: "/map", icon: <LocationIcon /> },
    { text: "911", link: "/reach911" },
  ],
  Dispatch: [
    { text: "Messages", link: "/messages", icon: <Message /> },
    { text: "Contacts", link: "/contacts", icon: <Contact /> },
    { text: "Groups", link: "/groups", icon: <Groups2Icon /> },
    { text: "Map", link: "/map", icon: <LocationIcon /> },
    { text: "Incidents", link: "/incidents", icon: <ErrorOutlineIcon /> },
    { text: "Dashboard", link: "/dashboard" },
  ],
  Police: [
    { text: "Messages", link: "/messages", icon: <Message /> },
    { text: "Contacts", link: "/contacts", icon: <Contact /> },
    { text: "Groups", link: "/groups", icon: <Groups2Icon /> },
    { text: "Map", link: "/map", icon: <LocationIcon /> },
    { text: "Incidents", link: "/incidents", icon: <ErrorOutlineIcon /> },
    // please add route here
    { text: "Resource Allocation", link: "/resources" },
    { text: "Patients", link: "/patients/first-responder" },
    { text: "Find Hospital", link: "/find-hospital" },
    { text: "Dashboard", link: "/dashboard" },
  ],
  Fire: [
    { text: "Messages", link: "/messages", icon: <Message /> },
    { text: "Contacts", link: "/contacts", icon: <Contact /> },
    { text: "Groups", link: "/groups", icon: <Groups2Icon /> },
    { text: "Map", link: "/map", icon: <LocationIcon /> },
    { text: "Incidents", link: "/incidents", icon: <ErrorOutlineIcon /> },
    // please add route here
    { text: "Resource Allocation", link: "/resources" },
    { text: "Patients", link: "/patients/first-responder" },
    { text: "Find Hospital", link: "/find-hospital" },
    { text: "Dashboard", link: "/dashboard" },
  ],
  Nurse: [
    { text: "Messages", link: "/messages", icon: <Message /> },
    { text: "Contacts", link: "/contacts", icon: <Contact /> },
    { text: "Groups", link: "/groups", icon: <Groups2Icon /> },
    { text: "Map", link: "/map", icon: <LocationIcon /> },
    // please add route here, now there will be no navigate
    { text: "Patients", link: "/patients/nurse" },
  ],
};

const Home: FunctionComponent = () => {
  const role = localStorage.getItem("role") ?? "Citizen";
  const tabs = roleTabs[role] || roleTabs["Citizen"];
  return (
    <List sx={{ width: "100%", maxWidth: 320, mx: "auto", padding: 0 }}>
      {tabs.map(({ text, link, icon }, index) => (
        <Fragment key={link}>
          <Link color="inherit" href={link} style={{ textDecoration: "none" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 10px",
                border: "1.5px solid #ddd",
                borderRadius: "8px",
                backgroundColor: text === "911" ? "#ff0000" : "#fff",
                marginBottom: "8px",
                width: "90%",
                marginTop: "5px",
                "&:hover": {
                  backgroundColor: text === "911" ? "#e60000" : "#f0f0f0",
                },
              }}
            >
              <ListItemText
                sx={{
                  flex: 1,
                  textAlign: "center",
                  color: text === "911" ? "#fff" : "inherit",
                }}
                primary={text}
              />
              {icon && <Box sx={{ ml: "auto", pr: 1 }}>{icon}</Box>}
            </Box>
          </Link>
        </Fragment>
      ))}
    </List>
  );
};

export default Home;
