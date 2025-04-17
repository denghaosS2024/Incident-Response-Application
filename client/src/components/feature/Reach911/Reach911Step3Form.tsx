import AddIcon from "@mui/icons-material/Add";
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IncidentType } from "../../../models/Incident";
import { updateIncident } from "../../../redux/incidentSlice";
import { AppDispatch, RootState } from "../../../redux/store";
import FireForm from "./FireForm";
import MedicalForm from "./MedicalForm";
import PoliceForm from "./PoliceForm";

interface Reach911Step3Props {
  isCreatedByFirstResponder?: boolean;
}

const Step3Form: React.FC<Reach911Step3Props> = ({
  isCreatedByFirstResponder,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const incident = useSelector(
    (state: RootState) => state.incidentState.incident,
  );
  const type = incident.type;
  const questions = incident.questions;
  // const type = useSelector(
  //   (state: RootState) => state.incidentState.incident.type,
  // );
  // const questions = useSelector(
  //   (state: RootState) => state.incidentState.incident.questions,
  // );
  const qLen = Array.isArray(questions) ? questions.length : 1;
  // setAdditionalForms()
  const [additionalForms, setAdditionalForms] = React.useState<number[]>(
    Array.from({ length: qLen }, (_, i) => i),
  );
  // Ref to track the bottom of the page
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const addMedicalForm = () => {
    setAdditionalForms([...additionalForms, additionalForms.length]);
  };

  const removeMedicalForm = (formIndex: number) => {
    // 1. Remove the form from the UI
    const updatedForms = additionalForms.filter((index) => index !== formIndex);

    // 2. Adjust indices to be sequential
    const reindexedForms = updatedForms.map((_, index) => index);
    setAdditionalForms(reindexedForms);

    // 3. Update the incident state by removing the corresponding question
    if (Array.isArray(incident.questions)) {
      const updatedQuestions = [...incident.questions];
      updatedQuestions.splice(formIndex, 1);

      dispatch(
        updateIncident({
          ...incident,
          questions: updatedQuestions,
        }),
      );
    }
  };

  // useEffect(() => {

  // }, [])

  // Scroll to the bottom whenever additionalForms changes
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [additionalForms]);

  /// Renders the correct form based on the type obtained from step 2
  const renderForm = () => {
    switch (type) {
      case IncidentType.Medical:
        return (
          <>
            {additionalForms.map((formId) => (
              <React.Fragment key={formId}>
                <MedicalForm
                  formIndex={formId}
                  isCreatedByFirstResponder={isCreatedByFirstResponder}
                  onRemove={removeMedicalForm}
                />
                <hr
                  style={{
                    margin: "20px 0",
                    border: "1px solid #000",
                  }}
                />
              </React.Fragment>
            ))}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <AddIcon onClick={addMedicalForm} style={{ cursor: "pointer" }} />
            </div>
            {/* Add a div to act as the scroll target */}
            <div ref={bottomRef}></div>
          </>
        );
      case IncidentType.Fire:
        return <FireForm></FireForm>;
      case IncidentType.Police:
        return <PoliceForm></PoliceForm>;
      default:
        return (
          <>
            <MedicalForm
              formIndex={0}
              isCreatedByFirstResponder={isCreatedByFirstResponder}
            />
            <FireForm></FireForm>
            <PoliceForm></PoliceForm>
          </>
        );
    }
  };

  return <>{renderForm()}</>;
};

export default Step3Form;
