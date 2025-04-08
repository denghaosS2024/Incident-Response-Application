import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import ClickableStepper, {
  StepIconStyle,
} from "../components/ClickableStepper";
import SARTaskStep1 from "../components/feature/SARTask/SARTaskStep1.tsx";
import SARTaskStep2 from "../components/feature/SARTask/SARTaskStep2.tsx";
import SARTaskStep3 from "../components/feature/SARTask/SARTaskStep3.tsx";
import SARTaskStep4 from "../components/feature/SARTask/SARTaskStep4.tsx";
import IIncident, { IncidentType } from "../models/Incident.ts";
import styles from "../styles/SARTaskPage.module.css";
import request, { IRequestError } from "../utils/request";

const SARTaskPage: React.FC = () => {
  const { incidentId: incidentId } = useParams<{ incidentId: string }>();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [currentIncident, setCurrentIncident] = useState<IIncident | null>(
    null,
  );

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const response: IIncident[] = await request(
          `/api/incidents?incidentId=${incidentId}`,
          {
            method: "GET",
          },
        );
        if (response.length !== 1) {
          alert(
            `Fetch Incident ${incidentId}, returned ${response.length} object(s)`,
          );
        }
        const incident = response[0];
        if (incident.type !== IncidentType.Sar) {
          alert(
            `Fetch Incident ${incidentId} with type: ${incident.type} (Not SAR Incident)`,
          );
        }
        setCurrentIncident(incident);
        // console.log(`Fetch Incident: ${JSON.stringify(response)}`)
      } catch (error) {
        const err = error as IRequestError;
        alert(
          `Error when fetching incidentId=${incidentId}.\nError: ${err.message}`,
        );
      }
    };
    fetchIncident().then();
  }, [incidentId]);

  const contents = [
    <SARTaskStep1
      incident={currentIncident}
      setIncident={setCurrentIncident}
    />,
    <SARTaskStep2
      incident={currentIncident}
      setIncident={setCurrentIncident}
    />,
    <SARTaskStep3
      incident={currentIncident}
      setIncident={setCurrentIncident}
    />,
    <SARTaskStep4
      incident={currentIncident}
      setIncident={setCurrentIncident}
    />,
  ];

  const handleStepChange = (step: number): void => {
    if (step < contents.length) {
      setActiveStep(step);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div style={{ pointerEvents: "auto" }}>
        <ClickableStepper
          numberOfSteps={contents.length}
          activeStep={activeStep}
          setActiveStep={handleStepChange}
          contents={contents}
          stepIconStyle={StepIconStyle.Square}
        />
      </div>
    </div>
  );
};

export default SARTaskPage;
