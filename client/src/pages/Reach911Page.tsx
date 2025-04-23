import Button from "@mui/material/Button";
import React, { useEffect, useState } from "react";
import ClickableStepper from "../components/ClickableStepper";
import styles from "../styles/Reach911Page.module.css";

import Reach911Step1 from "../components/feature/Reach911/Reach911Step1";
import Reach911Step2 from "../components/feature/Reach911/Reach911Step2";
import Reach911Step3 from "../components/feature/Reach911/Reach911Step3Form";
import Reach911Step4 from "../components/feature/Reach911/Reach911Step4";
import Reach911Step5 from "../components/feature/Reach911/Reach911Step5";

import { ISpending } from "@/models/Spending";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import IIncident from "../models/Incident";
import { updateIncident } from "../redux/incidentSlice";
import { AppDispatch, RootState } from "../redux/store";
import request from "../utils/request";

const STEP_CHAT = 3;

const Reach911Page: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  // Load saved step from localStorage or default to 0
  const [activeStep, setActiveStep] = useState<number>(() => {
    const savedStep = localStorage.getItem("911Step");
    return savedStep ? parseInt(savedStep, 10) : 0;
  });
  const incident: IIncident = useSelector(
    (state: RootState) => state.incidentState.incident,
  );
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const { incidentId, isCreatedByFirstResponder, autoPopulateData, readOnly } =
    location.state ?? {};
  const role = localStorage.getItem("role");
  const uid = localStorage.getItem("uid");
  const [totalSpending, setTotalSpending] = useState<number>(0);

  useEffect(() => {
    const initializeIncident = async () => {
      try {
        const username = localStorage.getItem("username");
        const token = localStorage.getItem("token");

        if (!username || !uid) {
          setError("No username or uid found");
          return;
        }

        if (incidentId || isCreatedByFirstResponder) {
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/incidents/${username}/active`,
          {
            headers: {
              "x-application-token": token ?? "",
              "x-application-uid": uid ?? "",
            },
          },
        );
        if (response.status === 404) {
          const createResponse = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/incidents/new`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-application-token": token ?? "",
                "x-application-uid": uid ?? "",
              },
              body: JSON.stringify({
                caller: username,
                owner: "System",
                incidentState: "Waiting",
                openingDate: new Date().toISOString(),
                commander: "System",
                incidentCallGroup: null,
              }),
            },
          );

          if (!createResponse.ok) {
            throw new Error(
              `Failed to create incident: ${createResponse.status}`,
            );
          }

          const newIncident = await createResponse.json();
          dispatch(updateIncident(newIncident));
          console.log("Created new incident:", newIncident._id);
          return;
        }

        if (!response.ok) {
          throw new Error(
            `Failed to check active incidents: ${response.status}`,
          );
        }

        const activeIncident = await response.json();
        dispatch(updateIncident(activeIncident));
        console.log("Found active incident:", activeIncident._id);
      } catch (error) {
        console.error("Error initializing incident:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to initialize incident",
        );
      }
    };

    initializeIncident();
  }, [dispatch, incidentId, isCreatedByFirstResponder]);

  useEffect(() => {
    if (!incident._id || activeStep == STEP_CHAT) return;
    console.log("CULPRIT3");
    updateIncidentCall();

    return;
  }, [incident]); // Triggers on any incident data change

  // If the user is first responder and viewing an incident
  useEffect(() => {
    const fetchIncidentAndPopulate = async (id: string) => {
      try {
        const data = await request(`/api/incidents?incidentId=${id}`);
        if (Array.isArray(data) && data.length > 0) {
          const fetchedIncident = data[0];
          dispatch(updateIncident(fetchedIncident));
        } else {
          console.error("No incident found for incidentId:", id);
        }
      } catch (err) {
        console.error("Error fetching incident details:", err);
      }
    };
    console.log(
      "Incident Id are autoPopulateData values are:{},{}",
      incidentId,
      autoPopulateData,
    );
    if (autoPopulateData && incidentId) {
      fetchIncidentAndPopulate(incidentId);
    }
  }, [autoPopulateData, incidentId, dispatch]);

  // Save step to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("911Step", activeStep.toString());
  }, [activeStep]);

  useEffect(() => {
    // Fetch total spending if we have an incident ID
    const fetchTotalSpending = async () => {
      if (!incidentId) return;

      try {
        const spendings = await request(
          `/api/spendings/?incidentId=${incidentId}`,
          { method: "GET" },
        );

        // Calculate total
        const total = spendings.reduce(
          (sum: number, spending: ISpending) => sum + spending.amount,
          0,
        );
        setTotalSpending(total);
      } catch (err) {
        console.error("Error fetching spending data:", err);
      }
    };

    fetchTotalSpending();
  }, [incidentId]);

  const contents = [
    <Reach911Step1
      autoPopulateData={autoPopulateData}
      isCreatedByFirstResponder={isCreatedByFirstResponder}
      incidentId={incidentId}
    />,
    <Reach911Step2 />,
    <Reach911Step3 isCreatedByFirstResponder={isCreatedByFirstResponder} />,
    <Reach911Step4 isCreatedByFirstResponder={isCreatedByFirstResponder} />,
  ];

  const isResponder =
    role === "Fire" ||
    role === "Police" ||
    role === "Dispatch" ||
    role === "Fire Chief" ||
    role === "Police Chief";
  if (isResponder) {
    contents.push(<Reach911Step5 incidentId={incidentId} />);
  }

  const isChief = role === "Fire Chief" || role === "Police Chief";

  const username = localStorage.getItem("username") ?? "";

  const isFirstResponder =
    incident?.assignedVehicles?.some((v) => v.usernames.includes(username)) &&
    incident?.commander !== username;

  const updateIncidentCall = async () => {
    const { ...safeIncident } = incident;
    try {
      const token = localStorage.getItem("token");
      const uid = localStorage.getItem("uid");

      if (!token || !uid || !incident._id) {
        setError("Authentication error: Missing token, UID, or incident ID.");
        return;
      }

      const url = `${import.meta.env.VITE_BACKEND_URL}/api/incidents/update`;
      console.log("send update Incident request");
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-application-token": token,
          "x-application-uid": uid,
        },
        body: JSON.stringify({
          ...safeIncident,
          incidentState: incident.incidentState || "Waiting",
          openingDate: incident.openingDate || new Date().toISOString(),
          owner: incident.owner || "System",
          commander: incident.commander || "System",
          caller: isCreatedByFirstResponder
            ? ""
            : (incident.caller ?? localStorage.getItem("username")),
        }),
      });

      if (response.status !== 204) {
        const errorText = await response.text();
        throw new Error(`Update failed: ${errorText}`);
      }

      console.log("Incident successfully updated.");
    } catch (error) {
      console.error("Error updating incident:", error);

      if (error && typeof error === "object" && "message" in error) {
        const errorMessage = String(error.message);
        console.error("Error details:", errorMessage);
        setError(errorMessage);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const handleNextStep = (): void => {
    const hasStep5 = contents.length === 5;

    if (activeStep === 3 && hasStep5) {
      // Keep special handling for first responders and auto-populated incidents
      if (
        isCreatedByFirstResponder === true ||
        (autoPopulateData === true && readOnly === false)
      ) {
        updateIncidentCall();
      }
      setActiveStep(activeStep + 1);
      setError(null);
    } else if (activeStep === contents.length - 2) {
      // Always use updateIncidentCall since incident was created on page load
      updateIncidentCall();
      setActiveStep(activeStep + 1);
      setError(null);
    } else if (activeStep < contents.length - 1) {
      setActiveStep(activeStep + 1);
      setError(null);
    }
  };

  // Allow navigation to any step in the stepper
  const handleStepChange = (step: number): void => {
    if (step < contents.length) {
      setActiveStep(step);
      setError(null);
    }
  };

  const lockedContents = contents.map((content, index) =>
    readOnly || isChief ? (
      <div key={index} style={{ pointerEvents: "none" }}>
        {content}
      </div>
    ) : (
      content
    ),
  );

  // Handler for Total Spending button
  const handleTotalSpendingClick = () => {
    navigate(`/spending-history/${incidentId}`);
  };

  // Format the total spending as currency
  const formattedTotalSpending = totalSpending.toLocaleString();

  return (
    <div
      className={styles.wrapper}
      style={
        readOnly && !isFirstResponder
          ? {
              pointerEvents: "none",
              position: "relative",
              paddingTop: "50px",
            }
          : {}
      }
    >
      {(readOnly && !isFirstResponder) ||
        (isChief && (
          <div
            style={{
              position: "relative",
              top: 0,
              left: 0,
              right: 0,
              padding: "10px",
              backgroundColor: "rgba(0,0,0,0.7)",
              color: "white",
              textAlign: "center",
              zIndex: 1000,
            }}
          >
            This incident is in read-only mode.
          </div>
        ))}

      <div style={readOnly ? { pointerEvents: "auto" } : {}}>
        <ClickableStepper
          numberOfSteps={contents.length}
          activeStep={activeStep}
          setActiveStep={handleStepChange}
          contents={lockedContents}
        />
      </div>
      <div className={styles.placeholder}>
        {error && (
          <div
            style={{
              color: "red",
              textAlign: "center",
              margin: "10px 0",
            }}
          >
            Error: {error}
          </div>
        )}
      </div>
      {activeStep != lockedContents.length - 1 && (
        <div className={styles.buttonWrapper}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleNextStep}
          >
            Next
          </Button>
        </div>
      )}

      {/* Total Spending button outside of the disabled area for chiefs */}
      {isChief && (
        <div
          className={styles.buttonWrapper}
          style={{
            pointerEvents: "auto",
            marginTop: "20px",
            position: "relative",
            zIndex: 1001,
          }}
        >
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            onClick={handleTotalSpendingClick}
            endIcon={
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "4px",
                  padding: "2px 8px",
                  marginLeft: "8px",
                }}
              >
                ${formattedTotalSpending}
              </div>
            }
          >
            Total Spending
          </Button>
        </div>
      )}
    </div>
  );
};

export default Reach911Page;
