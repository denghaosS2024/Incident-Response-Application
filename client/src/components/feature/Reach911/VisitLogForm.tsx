import IHospital from "@/models/Hospital";
import IPatient from "@/models/Patient";
import request, { IRequestError } from "@/utils/request";
import { MedicalQuestions } from "@/utils/types";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  IconButton,
  Link,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { RootState } from "../../../redux/store";
import Loading from "../../common/Loading";
import { IVisitLogForm } from "./IVisitLogForm";
import VisitLogHelper from "./VisitLogHelper";
import DrugEntry from "./DrugEntry";
// Default: E

// Returns the current date and time formatted as "MM.DD.YY-HH:mm"
// Example formats: "12.03.21-10:00" or "11.22.20-08:00"
const getCurrentDateTime = () => {
  const now = new Date();
  const formattedDate = `${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}.${String(now.getFullYear()).slice(-2)}-${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return formattedDate;
};

const VisitLogForm: React.FC<{
  username?: string;
  visitLogId?: string;
  active?: boolean;
}> = ({ username: propUsername, visitLogId, active }) => {
  const [formData, setFormData] = useState<IVisitLogForm>({
    priority: "E", // Default value, { value: 'E', label: 'E' },
    location: "",
    age: "",
    conscious: "",
    breathing: "",
    chiefComplaint: "",
    condition: "",
    drugs: [],
    allergies: "",
    hospitalId: "",
    hospitalName: "",
  });

  console.log("visitLogId:", visitLogId);
  console.log("active:", active);
  const isReadOnly = active === false;

  const drugEntryRef = useRef<DrugEntryHandle>(null);

  const navigate = useNavigate();

  // Set the visit time to the current date and time
  const [visitTime, setVisitTime] = useState(getCurrentDateTime());
  const [incidentId, setIncidentId] = useState("");
  const [currentPatient, setCurrentPatient] = useState<IPatient>(
    {} as IPatient,
  );
  const [currentHospital, setCurrentHospital] = useState<IHospital>(
    {} as IHospital,
  );

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
      | SelectChangeEvent<string>,
    child?: React.ReactNode,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const role = localStorage.getItem("role");
  // If the Visit is created by a First Responder, the Incident ID* is added and the default Location is Road
  // If the Visit is created by a Nurse, the default Location is ER
  const checkRole = () => {
    if (new Set(["Fire", "Police", "Administrator"]).has(role ?? "")) {
      const incidentId = incident.incidentId;

      setIncidentId(incidentId);
      // Set the location to Road, if the role is First Responder
      setFormData((prev) => ({
        ...prev,
        location: "Road",
      }));
      // Set patient data if available
      // This is to get the patient data from the incident
      setPatientData();
    } else if (role === "Nurse") {
      // Set the location to ER, if the role is Nurse
      setFormData((prev) => ({
        ...prev,
        location: "ER",
      }));
    }
  };

  // Pulls Age, Conscious, Breathing, and Chief Complaint from the Incident if available
  const setPatientData = () => {
    // Don't do anything if the incident or questions are not available
    if (
      !incident ||
      !incident.questions ||
      !Array.isArray(incident.questions) ||
      (incident.questions as MedicalQuestions[]).length == 0
    ) {
      return;
    }

    console.log("Incident questions:", incident.questions);

    // for (const question of incident.questions as MedicalQuestions[]) {
    //   // if (question.isPatient && question.username === propUsername) {
    //   if (question.username === propUsername) {
    //     console.log("Found patient data:", question);
    //     setFormData((prev) => ({
    //       ...prev,
    //       // Only update age if it exists and can be converted to a string
    //       age: question.age !== undefined ? question.age.toString() : prev.age,
    //       // Only update conscious if it exists and is not empty
    //       conscious:
    //         question.conscious !== "" ? question.conscious : prev.conscious,
    //       // Only update breathing if it exists and is not empty
    //       breathing:
    //         question.breathing !== "" ? question.breathing : prev.breathing,
    //       // Only update chiefComplaint if it exists and is not empty
    //       chiefComplaint: question.chiefComplaint
    //         ? question.chiefComplaint
    //         : prev.chiefComplaint,
    //     }));
    //     break;
    //   }
    // }
  };

  // Check the role when the component mounts
  React.useEffect(() => {
    // Set the visit time to the current date and time
    setVisitTime(getCurrentDateTime());
    // Check the role and set the incident ID if needed
    checkRole();
  }, []);

  const { loading } = useSelector((state: RootState) => state.contactState);
  const { incident } = useSelector((state: RootState) => state.incidentState);
  const { patients } = useSelector((state: RootState) => state.patientState);
  console.log("Incident:", incident);
  console.log("Incident questions:", incident.questions);
  console.log(patients);

  const getCurrentPatientId = () => {
    if (!patients || patients.length === 0 || !propUsername) {
      return "";
    }
    const patient = patients.find((p) => p.username === propUsername);
    return patient ? patient.patientId : "";
  };

  useEffect(() => {
    const patientId = getCurrentPatientId();
    const fetchPatient = async () => {
      try {
        const patient: IPatient = await request(
          `/api/patients/single?patientId=${patientId}`,
        );
        if (patient) {
          setCurrentPatient(patient);
        }
      } catch (e) {
        const error = e as IRequestError;
        console.log("Error fetching current patient " + error.message);
      }
    };

    fetchPatient();
  }, []);

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        if (currentPatient.hospitalId) {
          const hospital = await request(
            `/api/hospital?hospitalId=${currentPatient.hospitalId}`,
          );
          if (hospital) {
            console.log("hospital: ", hospital);
            console.log(currentPatient);
            setCurrentHospital(hospital as IHospital);
          }
        }
      } catch (e) {
        const error = e as IRequestError;
        console.log("Error fetching current hospital " + error.message);
      }
    };

    fetchHospital();
  }, [currentPatient]);

  useEffect(() => {
    console.log("Updated currentHospital:", currentHospital);
    setFormData((prev) => ({
      ...prev,
      hospitalId: currentHospital.hospitalId,
      hospitalName: currentHospital.hospitalName,
    }));
  }, [currentHospital]);

  useEffect(() => {
    const fetchVisitLog = async () => {
      try {
        const patientId = getCurrentPatientId();
        if (!patientId || !visitLogId) return;

        const result = await request(
          `/api/patients/visitLogs?patientId=${patientId}&visitLogId=${visitLogId}`,
        );

        if (result) {
          const {
            dateTime,
            incidentId,
            priority,
            location,
            age,
            conscious,
            breathing,
            chiefComplaint,
            condition,
            drugs,
            allergies,
            hospitalId,
            hospitalName,
          } = result;

          setVisitTime(dateTime ?? getCurrentDateTime());
          setIncidentId(incidentId ?? "");

          setFormData((prev) => ({
            ...prev,
            ...(priority && { priority }),
            ...(location && { location }),
            ...(age != null ? { age: age.toString() } : {}),
            ...(conscious && { conscious }),
            ...(breathing && { breathing }),
            ...(chiefComplaint && { chiefComplaint }),
            ...(condition && { condition }),
            ...(drugs ? { drugs: drugs.join(", ") } : {}),
            ...(allergies ? { allergies: allergies.join(", ") } : {}),
            ...(hospitalId && { hospitalId }),
            ...(hospitalName && { hospitalName }),
          }));
        }
      } catch (e) {
        const error = e as IRequestError;
        console.error("Error fetching visit log:", error.message);
      }
    };

    fetchVisitLog();
  }, [visitLogId, patients]);

  console.log("Current patient ID:", getCurrentPatientId());

  const onClickHospital = () => {
    navigate("/find-hospital");
  };

  const onClickRequestHelp = async () => {
    // const uid = localStorage.getItem('uid')

    // const hospital = await VisitLogHelper.getHospitalByUserId(uid ?? '')

    const channelId = currentHospital.hospitalGroupId;
    console.log(channelId);
    navigate(
      `/messages?channelId=${currentHospital.hospitalGroupId}&showAlert=true&patient=${currentPatient.patientId}`,
    );
  };

  if (loading) return <Loading />;

  return (
    <div className="flex flex-col gap-4 p-4 items-center">
      {isReadOnly && (
        <Box className="w-full mb-4 bg-yellow-100 border border-yellow-300 p-3 rounded">
          <Typography variant="body1" color="textSecondary">
            This visit log is read-only.
          </Typography>
        </Box>
      )}
      <div className="flex flex-col gap-2 items-start w-full">
        <p className="text-2xl font-bold text-start">Visit: {visitTime}</p>
        <p className="text-2xl font-bold text-start">
          Incident ID: {incidentId}
        </p>
      </div>

      {/* Priority */}
      <FormControl>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography sx={{ width: 120, flexShrink: 0 }}>Priority:</Typography>
          <Select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            disabled={isReadOnly}
            sx={{
              width: 200,
              height: 40,
              "& .MuiSelect-select": {
                padding: "8px 14px",
              },
            }}
          >
            {VisitLogHelper.priorities.map((priority) => (
              <MenuItem key={priority.value} value={priority.value}>
                {priority.label}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </FormControl>

      {/* Location */}
      <FormControl>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography sx={{ width: 120, flexShrink: 0 }}>Location:</Typography>
          <RadioGroup
            name="location"
            value={formData.location}
            onChange={handleChange}
            row
            sx={{ gap: 2 }}
          >
            {VisitLogHelper.locations.map((location) => (
              <FormControlLabel
                key={location.value}
                value={location.value}
                label={location.label}
                sx={{ marginRight: 3 }}
                control={<Radio disabled={isReadOnly} />}
              />
            ))}
          </RadioGroup>
        </Box>
      </FormControl>

      {/* Age */}
      <FormControl>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography sx={{ width: 120, flexShrink: 0 }}>Age:</Typography>
          <Box display="flex" alignItems="center">
            <IconButton
              onClick={() => {
                const newValue =
                  formData.age === ""
                    ? 0
                    : Math.max(0, parseInt(formData.age) - 1);
                // setFormData((prev) => ({
                //   ...prev,
                //   age: newValue.toString(),
                // }));
              }}
              size="small"
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
            <TextField
              variant="outlined"
              name="age"
              value={formData.age}
              onChange={handleChange}
              type="number"
              inputProps={{ min: 0 }}
              sx={{ width: 100, mx: 1 }}
              size="small"
              InputProps={{ readOnly: isReadOnly }}
            />
            <IconButton
              onClick={() => {
                const newValue =
                  formData.age === "" ? 1 : parseInt(formData.age) + 1;
                // setFormData((prev) => ({
                //   ...prev,
                //   age: newValue.toString(),
                // }));
              }}
              size="small"
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </FormControl>

      {/* Conscious */}
      <FormControl>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography sx={{ width: 120, flexShrink: 0 }}>Conscious:</Typography>
          <RadioGroup
            name="conscious"
            value={formData.conscious}
            onChange={handleChange}
            row
            sx={{ gap: 2 }}
          >
            <FormControlLabel
              value="Yes"
              label="Yes"
              sx={{ marginRight: 3 }}
              control={<Radio disabled={isReadOnly} />}
            />
            <FormControlLabel
              value="No"
              control={<Radio disabled={isReadOnly} />}
              label="No"
            />
          </RadioGroup>
        </Box>
      </FormControl>

      {/* Breathing */}
      <FormControl>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography sx={{ width: 120, flexShrink: 0 }}>Breathing:</Typography>
          <RadioGroup
            name="breathing"
            value={formData.breathing}
            onChange={handleChange}
            row
            sx={{ gap: 2 }}
          >
            <FormControlLabel
              value="Yes"
              label="Yes"
              sx={{ marginRight: 3 }}
              control={<Radio disabled={isReadOnly} />}
            />
            <FormControlLabel
              value="No"
              control={<Radio disabled={isReadOnly} />}
              label="No"
            />
          </RadioGroup>
        </Box>
      </FormControl>

      {/* Chief Complaint */}
      <FormControl>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography sx={{ width: 120, flexShrink: 0 }}>
            Chief Complaint:
          </Typography>
          <TextField
            variant="outlined"
            name="chiefComplaint"
            value={formData.chiefComplaint}
            onChange={handleChange}
            fullWidth
            size="small"
            InputProps={{ readOnly: isReadOnly }}
          />
        </Box>
      </FormControl>

      {/* Condition */}
      <FormControl>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography sx={{ width: 120, flexShrink: 0 }}>Condition:</Typography>
          <Select
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            sx={{
              width: 200,
              height: 40,
              "& .MuiSelect-select": {
                padding: "8px 14px",
              },
            }}
            disabled={isReadOnly}
          >
            {VisitLogHelper.conditions.map((condition) => (
              <MenuItem key={condition.value} value={condition.value}>
                {condition.label}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </FormControl>

      {/* Drugs */}
      <FormControl>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography sx={{ width: 120, flexShrink: 0 }}>Drugs:</Typography>
          <Box sx={{ flex: 1, width: 200 }}>
          <DrugEntry isReadOnly={isReadOnly} ref={drugEntryRef} />
          </Box>
        </Box>
      </FormControl>

      {/* Allergies */}
      <FormControl>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography sx={{ width: 120, flexShrink: 0 }}>Allergies:</Typography>

          <TextField
            variant="outlined"
            name="allergies"
            value={formData.allergies}
            onChange={handleChange}
            fullWidth
            size="small"
            InputProps={{ readOnly: isReadOnly }}
          />
        </Box>
      </FormControl>

      {/* Hospital */}
      <FormControl>
        <Box display="flex" alignItems="center" gap={2}>
          <Box className="flex flex-row">
            <Typography sx={{ width: 120, flexShrink: 0 }}>
              Hospital: {currentHospital?.hospitalName ?? "None"}
            </Typography>
          </Box>

          {!currentPatient.hospitalId &&
            (localStorage.getItem("role") === "Fire" ||
              localStorage.getItem("role") === "Police") && (
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={onClickHospital}
              >
                Find Hospital
              </Button>
            )}
        </Box>
      </FormControl>

      {/*Request Help*/}
      {localStorage.getItem("role") === "Nurse" && (
        <FormControl>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography sx={{ width: 120, flexShrink: 0 }}>
              Request Help:
            </Typography>
            <Link
              // href={`/messages?channelId=${hospitalGroupId}&showAlert=true&patient=${patientId}`}
              style={{ textDecoration: "none" }}
            >
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={onClickRequestHelp}
              >
                Request Help
              </Button>
            </Link>
          </Box>
        </FormControl>
      )}

      {!isReadOnly && (
        <Box display="flex" justifyContent="center" mt={4}>
          <button
            style={{
              padding: "10px 20px",
              backgroundColor: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "16px",
            }}
            onClick={() => {
              const drugs = (drugEntryRef.current?.getDrugsData() ?? []).map(
                (drug) => `${drug.name} (${drug.dosage}, ${drug.route})`
              );              
            
              VisitLogHelper.saveFormData(
                {
                  ...formData,
                  drugs,
                },
                incidentId,
                visitTime,
                getCurrentPatientId() ?? "",
              );
            }}            
          >
            Save
          </button>
        </Box>
      )}
    </div>
  );
};

export default VisitLogForm;
