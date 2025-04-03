import { MedicalQuestions } from '@/utils/types'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
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
} from '@mui/material'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { RootState } from '../../../redux/store'
import Loading from '../../common/Loading'
import { IVisitLogForm } from './IVisitLogForm'
import VisitLogHelper from './VisitLogHelper'

const hospitalGroupId = '67e74c979e55e050073d6afb'
const patientId = '455tt'

// Default: E

// Returns the current date and time formatted as "MM.DD.YY-HH:mm"
// Example formats: "12.03.21-10:00" or "11.22.20-08:00"
const getCurrentDateTime = () => {
  const now = new Date()
  const formattedDate = `${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}.${String(now.getFullYear()).slice(-2)}-${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  return formattedDate
}

const VisitLogForm: React.FC<{ username?: string }> = ({
  username: propUsername,
}) => {
  const [formData, setFormData] = useState<IVisitLogForm>({
    priority: 'E', // Default value, { value: 'E', label: 'E' },
    location: 'Road',
    age: '',
    conscious: 'Yes',
    breathing: 'Yes',
    chiefComplaint: 'Difficulty Breathing',
    condition: '',
    drugs: '',
    allergies: '',
  })

  const navigate = useNavigate()

  // Set the visit time to the current date and time
  const [visitTime, setVisitTime] = useState(getCurrentDateTime())
  const [incidentId, setIncidentId] = useState('')

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
      | SelectChangeEvent<string>,
    child?: React.ReactNode,
  ) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }))
  }

  const role = localStorage.getItem('role')
  // If the Visit is created by a First Responder, the Incident ID* is added and the default Location is Road
  // If the Visit is created by a Nurse, the default Location is ER
  const checkRole = () => {
    if (new Set(['Fire', 'Police', 'Administrator']).has(role ?? '')) {
      const incidentId = incident.incidentId

      setIncidentId(incidentId)
      // Set the location to Road, if the role is First Responder
      setFormData((prev) => ({
        ...prev,
        location: 'Road',
      }))
      // Set patient data if available
      // This is to get the patient data from the incident
      setPatientData()
    } else if (role === 'Nurse') {
      // Set the location to ER, if the role is Nurse
      setFormData((prev) => ({
        ...prev,
        location: 'ER',
      }))
    }
  }

  // Pulls Age, Conscious, Breathing, and Chief Complaint from the Incident if available
  const setPatientData = () => {
    // Don't do anything if the incident or questions are not available
    if (
      !incident ||
      !incident.questions ||
      !Array.isArray(incident.questions) ||
      (incident.questions as MedicalQuestions[]).length == 0
    ) {
      return
    }

    for (const question of incident.questions as MedicalQuestions[]) {
      if (question.isPatient && question.username === propUsername) {
        console.log('Found patient data:', question)
        setFormData((prev) => ({
          ...prev,
          // Only update age if it exists and can be converted to a string
          age: question.age !== undefined ? question.age.toString() : prev.age,
          // Only update conscious if it exists and is not empty
          conscious: question.conscious ? question.conscious : prev.conscious,
          // Only update breathing if it exists and is not empty
          breathing: question.breathing ? question.breathing : prev.breathing,
          // Only update chiefComplaint if it exists and is not empty
          chiefComplaint: question.chiefComplaint
            ? question.chiefComplaint
            : prev.chiefComplaint,
        }))
        break
      }
    }
  }

  // Check the role when the component mounts
  React.useEffect(() => {
    // Set the visit time to the current date and time
    setVisitTime(getCurrentDateTime())
    // Check the role and set the incident ID if needed
    checkRole()
  }, [])

  const { loading } = useSelector((state: RootState) => state.contactState)
  const { incident } = useSelector((state: RootState) => state.incidentState)
  const { patients } = useSelector((state: RootState) => state.patientState)
  console.log(patients)

  const getCurrentPatientId = () => {
    if (!patients || patients.length === 0 || !propUsername) {
      return null
    }
    const patient = patients.find((p) => p.username === propUsername)
    return patient ? patient.patientId : null
  }

  console.log('Current patient ID:', getCurrentPatientId())

  const onClickHospital = () => {
    navigate('/find-hospital')
  }

  const onClickRequestHelp = async () => {
    const uid = localStorage.getItem('uid')

    const hospital = await VisitLogHelper.getHospitalByUserId(uid ?? '')

    const channelId = hospital.hospitalGroupId
    console.log(channelId)
    navigate(
      `/messages?channelId=${channelId}&showAlert=true&patient=${patientId}`,
    )
  }

  if (loading) return <Loading />

  return (
    <div className="flex flex-col gap-4 p-4 items-center">
      <div className="flex flex-col gap-2 items-start w-full">
        <p className="text-2xl font-bold text-start">Visit: {visitTime}</p>
        <p className="text-2xl font-bold text-start">
          Incident ID: {incidentId}
        </p>
      </div>

      {/* Priority */}
      <FormControl>
        <div>
          <Typography sx={{ width: 120, flexShrink: 0 }}>Priority:</Typography>
          <Select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            sx={{
              width: 200,
              height: 40,
              '& .MuiSelect-select': {
                padding: '8px 14px',
              },
            }}
          >
            {VisitLogHelper.priorities.map((priority) => (
              <MenuItem key={priority.value} value={priority.value}>
                {priority.label}
              </MenuItem>
            ))}
          </Select>
        </div>
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
                control={<Radio />}
                label={location.label}
                sx={{ marginRight: 3 }}
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
                  formData.age === ''
                    ? 0
                    : Math.max(0, parseInt(formData.age) - 1)
                setFormData((prev) => ({
                  ...prev,
                  age: newValue.toString(),
                }))
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
            />
            <IconButton
              onClick={() => {
                const newValue =
                  formData.age === '' ? 1 : parseInt(formData.age) + 1
                setFormData((prev) => ({
                  ...prev,
                  age: newValue.toString(),
                }))
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
              control={<Radio />}
              label="Yes"
              sx={{ marginRight: 3 }}
            />
            <FormControlLabel value="No" control={<Radio />} label="No" />
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
              control={<Radio />}
              label="Yes"
              sx={{ marginRight: 3 }}
            />
            <FormControlLabel value="No" control={<Radio />} label="No" />
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
              '& .MuiSelect-select': {
                padding: '8px 14px',
              },
            }}
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
          <TextField
            variant="outlined"
            name="drugs"
            value={formData.drugs}
            onChange={handleChange}
            fullWidth
            size="small"
          />
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
          />
        </Box>
      </FormControl>

      {/* Hospital */}
      <FormControl>
        <Box display="flex" alignItems="center" gap={2}>
          <Box className="flex flex-row">
            <Typography
              sx={{ width: 120, flexShrink: 0 }}
              className="flex flex-row"
            >
              Hospital: None
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={onClickHospital}
          >
            Find Hospital
          </Button>
        </Box>
      </FormControl>

      {/*Request Help*/}
      {localStorage.getItem('role') === 'Nurse' && (
        <FormControl>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography sx={{ width: 120, flexShrink: 0 }}>
              Request Help:
            </Typography>
            <Link
              // href={`/messages?channelId=${hospitalGroupId}&showAlert=true&patient=${patientId}`}
              style={{ textDecoration: 'none' }}
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

      <Box display="flex" justifyContent="center" mt={4}>
        <button
          style={{
            padding: '10px 20px',
            backgroundColor: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
          onClick={() => {
            VisitLogHelper.saveFormData(
              formData,
              incidentId,
              visitTime,
              getCurrentPatientId() ?? '',
            )
          }}
        >
          Save
        </button>
      </Box>
    </div>
  )
}

export default VisitLogForm
