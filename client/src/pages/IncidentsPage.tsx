import GenericItemizeContainer from "@/components/GenericItemizeContainer";
import ROLES from "@/utils/Roles";
import {
  Add,
  NavigateNext as Arrow,
  Close,
  Settings,
} from "@mui/icons-material";
import {
  Box,
  FormControl,
  IconButton,
  Menu,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import IIncident, { IncidentPriority, IncidentType } from "../models/Incident";
import { resetIncident, updateIncident } from "../redux/incidentSlice";
import request from "../utils/request";

function IncidentsPage() {
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [data, setData] = useState<IIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const [selectedType, setSelectedType] = useState("All");
  const [userId] = useState(localStorage.getItem("username") ?? "");
  const [filteredData, setFilteredData] = useState<IIncident[]>([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetIncident());
  }, [dispatch]);

  // Retrieve role from localStorage
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) setRole(storedRole);
  }, []);

  // Fetch incidents from the server
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const data = await request("/api/incidents");
        console.log("Fetched data:", data);
        setData(data);
      } catch (err: any) {
        if (
          err &&
          err.message &&
          err.message.includes("Unexpected end of JSON input") // NEED TO REFACTOR AND HANDLE IN BACKEND
        ) {
          setData([]);
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [role]);

  // Filter incidents based on selected type
  useEffect(() => {
    if (selectedType === "All") {
      setFilteredData(data);
    } else {
      const mappedType = {
        Fire: IncidentType.Fire,
        Medical: IncidentType.Medical,
        Police: IncidentType.Police,
        Unset: IncidentType.Unset,
      }[selectedType];
      setFilteredData(data.filter((incident) => incident.type === mappedType));
    }
  }, [selectedType, data]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Sort incidents by opening date function
  const sortByOpeningDate = (incidents: IIncident[]) =>
    incidents.sort(
      (a, b) =>
        new Date(a.openingDate).getTime() - new Date(b.openingDate).getTime(),
    );

  // Group incidents for display based on role
  let incidentGroups: { [key: string]: IIncident[] } = {};
  if (role === "Fire" || role === "Police") {
    const filteredByAssigned = filteredData.filter(
      (incident) => incident.incidentState === "Assigned",
    );
    const priorityOrder: Record<string, number> = {
      E: 1,
      One: 2,
      Two: 3,
      Three: 4,
    };

    const sortByPriorityOnly = (incidents: IIncident[]) =>
      incidents.sort((a, b) => {
        const priorityA = priorityOrder[a.priority] || 99;
        const priorityB = priorityOrder[b.priority] || 99;
        return priorityA - priorityB;
      });

    const isUserInvolvedInIncident = (incident: IIncident, userId: string) =>
      incident.commander === userId ||
      incident.assignedVehicles?.some((v) => v.usernames.includes(userId));

    incidentGroups = {
      "My Incident": filteredByAssigned.filter((incident) =>
        isUserInvolvedInIncident(incident, userId),
      ),
      "Other Open Incidents": sortByPriorityOnly(
        filteredByAssigned.filter(
          (incident) => !isUserInvolvedInIncident(incident, userId),
        ),
      ),

      "Closed Incidents": sortByOpeningDate(
        filteredData.filter((incident) => incident.incidentState === "Closed"),
      ),
    };
  } else {
    incidentGroups = {
      Waiting: sortByOpeningDate(
        filteredData.filter((incident) => incident.incidentState === "Waiting"),
      ),
      Triage: sortByOpeningDate(
        filteredData.filter(
          (incident) =>
            incident.incidentState === "Triage" && incident.owner === userId,
        ),
      ),
      Assigned: sortByOpeningDate(
        filteredData.filter(
          (incident) =>
            incident.incidentState === "Assigned" && incident.owner === userId,
        ),
      ),
      Closed: sortByOpeningDate(
        filteredData.filter(
          (incident) =>
            incident.incidentState === "Closed" && incident.owner === userId,
        ),
      ),
    };
  }

  // Create new incident when the + button is clicked and redirect to the first page
  const handleAddIncident = async () => {
    try {
      const username = localStorage.getItem("username");
      if (!username) throw new Error("Username not found in local storage.");

      let incidentCount = 1;
      try {
        const userIncidents = await request(
          `/api/incidents?caller=${username}`,
        );
        incidentCount = Array.isArray(userIncidents)
          ? userIncidents.length + 1
          : 1;
      } catch (error: any) {
        if (
          error &&
          error.message &&
          error.message.includes("Unexpected end of JSON input")
        ) {
          incidentCount = 1;
        } else {
          throw error;
        }
      }

      const user = await request(`/api/users/${username}`, {
        method: "GET",
      });

      console.log("User data:", user);

      const incidentId = `I${username}${incidentCount}`;
      const newIncident: IIncident = {
        _id: "",
        incidentId,
        caller: "",
        openingDate: new Date().toISOString(),
        incidentState: "Assigned",
        owner: username,
        commander: username,
        city: user.assignedCity,
        address: "",
        type: IncidentType.Unset,
        questions: null,
        incidentCallGroup: null,
        respondersGroup: null,
        priority: IncidentPriority.Unset,
        location: undefined,
        assignedVehicles: [],
        resources: [],
        searchOperation: undefined,
        sarTasks: [],
      };
      
      // console.log("New incident data:", newIncident); 

      await request("/api/incidents/new", {
        method: "POST",
        body: JSON.stringify(newIncident),
        headers: { "Content-Type": "application/json" },
      });

      dispatch(updateIncident(newIncident));

      navigate("/reach911", {
        state: {
          incidentId,
          isCreatedByFirstResponder: true,
        },
      });
    } catch (error) {
      console.error("Error creating new incident:", error);
    }
  };

  const handleAddSARIncident = async () => {
    try {
      const username = localStorage.getItem("username");
      if (!username) throw new Error("Username not found in local storage.");

      // Get the count of SAR incidents for this user
      let sarIncidentCount = 1;
      try {
        // Filter for SAR incidents (type 'S') created by this user
        const userSARIncidents = await request(
          `/api/incidents?caller=${username}&type=S`,
        );
        sarIncidentCount = Array.isArray(userSARIncidents)
          ? userSARIncidents.length + 1
          : 1;
      } catch (error: any) {
        if (
          error &&
          error.message &&
          error.message.includes("Unexpected end of JSON input")
        ) {
          sarIncidentCount = 1;
        } else {
          throw error;
        }
      }

      // Create a unique SAR Incident ID (e.g. "SDena12")
      const sarIncidentId = `S${username}${sarIncidentCount}`;

      // Create the new SAR incident with the specified properties
      const newSARIncident = {
        incidentId: sarIncidentId,
        caller: username,
        openingDate: new Date().toISOString(),
        incidentState: "Assigned",
        owner: username,
        commander: username,
        type: "S", // SAR incident type
      };

      // Save the new SAR incident to the server
      const response = await request("/api/incidents/new", {
        method: "POST",
        body: JSON.stringify(newSARIncident),
        headers: { "Content-Type": "application/json" },
      });

      // Update Redux store with the new incident data
      dispatch(updateIncident(response ?? newSARIncident));

      // Navigate to the SAR incident page
      navigate("/sar-incident", {
        state: {
          incidentId: sarIncidentId,
          isCreatedByFirstResponder: true,
        },
      });
    } catch (error) {
      console.error("Error creating new SAR incident:", error);
    }
  };

  // Check if the user has an active incident (not closed)
  const hasActiveResponderIncident = data.some(
    (incident) =>
      incident.incidentState !== "Closed" &&
      (incident.commander === userId ||
        incident.assignedVehicles?.some((vehicle) =>
          vehicle.usernames.includes(userId),
        )),
  );

  // Navigate to incident description with auto-populate on
  const handleIncidentClick = (incident: IIncident) => {
    let readOnly = false;

    let updatedIncident = incident;
    if (incident.incidentState === "Waiting" && role === ROLES.DISPATCH) {
      // Update incident's state, owner and commander
      updatedIncident = {
        ...incident,
        incidentState: "Triage",
        owner: userId,
        commander: userId,
      };
      try {
        //todo: refactor incident endpoint to comply with REST best practices
        request("/api/incidents/update", {
          method: "PUT",
          body: JSON.stringify(updatedIncident),
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Error updating incident:", error);
      }
    }

    // SAR special case: allow edit if not closed and user is in a car assigned to a SAR task
    function isUserInAssignedCarForSAR(incident: IIncident, userId: string): boolean {
      if (!incident.sarTasks) return false;
      // Each SAR task may have assignedCars, each with members (by id or username)
      return incident.sarTasks.some((task: any) =>
        task.assignedCars?.some((car: any) =>
          car.members?.some((member: any) => member.id === userId || member.username === userId)
        )
      );
    }

    if (updatedIncident.type === "S") {
      // SAR: only closed is readonly, otherwise allow edit for all involved
      if (updatedIncident.incidentState === "Closed") {
        readOnly = true;
      } else {
        // If not closed, allow edit if user is commander, owner, or assigned to a car
        readOnly =
          updatedIncident.commander !== userId &&
          updatedIncident.owner !== userId &&
          !isUserInAssignedCarForSAR(updatedIncident, userId);
      }
    } else {
      if (
        updatedIncident.incidentState === "Closed" ||
        (updatedIncident.commander !== userId && updatedIncident.owner !== userId)
      ) {
        readOnly = true;
      }
    }

    // Update sate in redux with updated incident
    console.log("Updated incident:", updatedIncident);

    // Wait for a second just to let backend do its thing 
    setTimeout(()=>{
      // dispatch(resetIncident())
      // dispatch(updateIncident(updatedIncident))

      const autoPopulateData = true;

      // Check if this is a SAR incident (type 'S')
      if (incident.type === "S") {
        // Navigate to the SAR incident page
        navigate("/sar-incident", {
          state: {
            incidentId: incident.incidentId,
            readOnly,
            autoPopulateData,
          },
        });
      } else {

        console.log(incident.caller)

        if (!incident.caller) {
          navigate("/reach911", {
            state: {
              incidentId: incident.incidentId,
              readOnly,
              autoPopulateData,
              isCreatedByFirstResponder: true
            },
          });
        } else {
          // Navigate to the regular Reach911 page for other incident types
          navigate("/reach911", {
            state: {
              incidentId: incident.incidentId,
              readOnly,
              autoPopulateData,
              isCreatedByFirstResponder: false
            },
          });
        }
          
      }
    }, 250);
  };

  // const handleCloseCurrentIncident = async () => {
  //     try {
  //         // Find the user's active incident (where they are commander or owner)
  //         const activeIncident = data.find(
  //             (incident) =>
  //                 (incident.commander === userId ||
  //                     incident.owner === userId) &&
  //                 incident.incidentState !== 'Closed',
  //         )

  //         if (!activeIncident) {
  //             console.error('No active incident found to close')
  //             return
  //         }

  //         // Update the incident state to 'Closed'
  //         const updatedIncident = {
  //             ...activeIncident,
  //             incidentState: 'Closed',
  //         }

  //         // Send the update to the server
  //         await request('/api/incidents/update', {
  //             method: 'PUT',
  //             body: JSON.stringify(updatedIncident),
  //             headers: { 'Content-Type': 'application/json' },
  //         })

  //         // Refresh the incident list
  //         const refreshedData = await request('/api/incidents')
  //         setData(refreshedData)

  //         console.log(`Incident ${activeIncident.incidentId} has been closed`)
  //     } catch (error) {
  //         console.error('Error closing incident:', error)
  //     }
  // }

  // Render the page
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        Incidents Dashboard
      </Typography>
      {Object.entries(incidentGroups).map(([header, incidents]) => (
        <GenericItemizeContainer<IIncident>
          key={header}
          items={incidents}
          getKey={(incident) => incident.incidentId}
          title={header}
          showHeader={false}
          emptyMessage="No incidents available"
          columns={[
            {
              key: "incidentId",
              align: "center",
              label: "Incident ID",
              render: (incident) => incident.incidentId,
            },
            {
              key: "openingDate",
              align: "center",
              label: "Opening Date",
              render: (incident) =>
                new Date(incident.openingDate).toLocaleString("en-US", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                }),
            },
            {
              key: "type",
              align: "center",
              label: "Type",
              render: (incident) => incident.type,
            },
            {
              key: "priority",
              align: "center",
              label: "Priority",
              render: (incident) => {
                const priorityMap: Record<string, string> = {
                  One: "1",
                  Two: "2",
                  Three: "3",
                };
                return priorityMap[incident.priority] || incident.priority; // Default to original value if not found
              },
            },
            {
              key: "incidentId",
              align: "center",
              label: "Action",
              render: (incident) => (
                <IconButton
                  edge="end"
                  size="large"
                  onClick={() => handleIncidentClick(incident)}
                >
                  <Arrow />
                </IconButton>
              ),
            },
          ]}
        />
      ))}
      {role === "Fire" || role === "Police" ? (
        <>
          <IconButton
            sx={{
              position: "fixed",
              bottom: 16,
              left: 18,
              width: 56,
              height: 56,
            }}
            onClick={(event) => setFilterAnchorEl(event.currentTarget)}
          >
            <Settings />
            <Typography
              variant="caption"
              sx={{ marginLeft: 1, fontSize: "medium" }}
            >
              Type
            </Typography>
          </IconButton>
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={() => setFilterAnchorEl(null)}
          >
            <MenuItem>
              <FormControl fullWidth>
                <Select
                  value={selectedType}
                  onChange={(event) => {
                    setSelectedType(event.target.value);
                    setFilterAnchorEl(null);
                  }}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Fire">Fire</MenuItem>
                  <MenuItem value="Medical">Medical</MenuItem>
                  <MenuItem value="Police">Police</MenuItem>
                  <MenuItem value="SAR">SAR</MenuItem>
                </Select>
              </FormControl>
            </MenuItem>
          </Menu>
          {!hasActiveResponderIncident && (
            <>
              <Tooltip title="Create new SAR incident">
                <IconButton
                  sx={{
                    position: "fixed",
                    bottom: 16,
                    right: 70,
                    width: 56,
                    height: 56,
                  }}
                  onClick={handleAddSARIncident}
                >
                  <Close fontSize="large" />
                </IconButton>
              </Tooltip>

              <IconButton
                sx={{
                  position: "fixed",
                  bottom: 16,
                  right: 10,
                  width: 56,
                  height: 56,
                }}
                onClick={handleAddIncident}
              >
                <Add fontSize="large" />
              </IconButton>
            </>
          )}
          {/* Commented out testing close functionality button
          {hasActiveResponderIncident && (
            <Tooltip title="Close current incident">
              <IconButton
                sx={{
                  position: 'fixed',
                  bottom: 30,
                  right: 70,
                  width: 56,
                  height: 56,
                  bgcolor: 'error.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'error.dark',
                  },
                }}
                onClick={handleCloseCurrentIncident}
              >
                <Close fontSize="large" />
              </IconButton>
            </Tooltip>
          )}
          */}
        </>
      ) : null}
    </Box>
  );
}

export default IncidentsPage;
