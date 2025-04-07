import request, { IRequestError } from "@/utils/request.ts"
import { Box, Checkbox, FormControl, FormControlLabel, FormGroup, TextField } from '@mui/material'
import React, { ChangeEvent, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import IIncident from '../../../models/Incident.ts'
import styles from '../../../styles/SARTaskPage.module.css'
import AddressBar from './AddressBar.tsx'
import ReturnToTasksBtn from './ReturnToTasksBtn.tsx'
import SARTaskTitle from './SARTaskTitle.tsx'

const hazardTypes = [
  'Active Electric Wire',
  'Dogs',
  'Explosives',
  'Fire',
  'Flood',
  'Gas',
  'Rats',
  'Others'
]

interface HazardSelections {
  [key: string]: boolean
}

interface SARTaskStep2Props {
  incident?: IIncident | null
  setIncident: (incident: IIncident) => void
}

const SARTaskStep2: React.FC<SARTaskStep2Props> = ({ incident, setIncident }) => {
  const [searchParams] = useSearchParams()
  const taskId = parseInt(searchParams.get('taskId') ?? '0')
  const [selectedHazards, setSelectedHazards] = useState<HazardSelections>({})
  const [otherHazardText, setOtherHazardText] = useState<string>('')
  const [needSave, setNeedSave] = useState<boolean>(false)
  const [readOnly, setReadOnly] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // update form states
  useEffect(() => {
    if (incident === null || incident?.sarTasks === null) return
    const hazards = incident?.sarTasks?.at(taskId)?.hazards || []

    // update selectedHazards
    const newSelectedHazards: HazardSelections = {}
    hazardTypes.forEach(hazard => {
      newSelectedHazards[hazard] = false
    })
    hazards.forEach(hazard => {
      if (hazardTypes.includes(hazard)) {
        newSelectedHazards[hazard] = true
      } else {
        newSelectedHazards['Others'] = true
      }
    })
    setSelectedHazards(newSelectedHazards)

    // update otherHazardText
    const otherHazard = hazards.reduce((acc, hazard) => {
      if (!hazardTypes.includes(hazard) || hazard === 'Others') {
        return acc + hazard
      }
      return acc
    }, '')
    setOtherHazardText(otherHazard)

    // update readOnly
    setReadOnly(incident?.sarTasks?.at(taskId)?.state === 'Done')
  }, [incident])

  // save form data
  const saveData = async () => {
    if (!incident) return

    if (!needSave) {
      console.log('[Step2] Form data not updated. Do not update to database', new Date())
      return
    }

    // get hazards from form states
    const hazards = Object.keys(selectedHazards)
      .filter(hazard => selectedHazards[hazard] && hazard !== 'Others')
    if (selectedHazards['Others'] && otherHazardText.trim()) {
      hazards.push(otherHazardText.trim())
    }

    setSaving(true)
    try {
      const currentSarTask = incident?.sarTasks?.at(taskId)
      const response: IIncident = await request(
        `/api/incidents/sar/${incident.incidentId}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            taskId: taskId,
            sarTask: {
              ...currentSarTask,
              hazards: hazards,
            }
          }),
        }
      )
      // console.log('SAR task updated successfully:', JSON.stringify(response))
      console.log('SAR task updated successfully:', hazards)
      setIncident(response)
      setLastSaved(new Date())
      setNeedSave(false)
    } catch (error) {
      const err = error as IRequestError
      console.error('Error updating SAR task:', err.message)
    } finally {
      setSaving(false)
    }
  }

  // Auto-save on form changes with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (incident) {
        saveData().then()
      }
    }, 1000) // Auto-save after 1 second of inactivity

    return () => clearTimeout(debounceTimer)
  }, [selectedHazards, otherHazardText])

  const handleHazardChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedHazards({
      ...selectedHazards,
      [event.target.name]: event.target.checked
    })

    // Exclude scenario: 'Others' checked but no text input yet
    if (!(event.target.name === 'Others' && event.target.checked && !otherHazardText.trim())) {
      setNeedSave(true)
    }
  }

  const handleOtherHazardChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOtherHazardText(event.target.value)
    setNeedSave(true)
  }

  return (
    <div className={styles.wrapperStep}>
      <AddressBar task={incident?.sarTasks?.at(taskId)} />
      <div className="mt-2"></div> {/* add space between components */}

      <SARTaskTitle
        title={'Hazards'}
        subtitle={'Select the hazards you notice:'}
      />

      {/* Saving indicator */}
      <div style={{ textAlign: 'right', padding: '0 1rem', fontSize: '0.8rem', color: 'gray' }}>
        {saving ? 'Saving...' : lastSaved ? `Last saved: ${lastSaved.toLocaleTimeString()}` : ''}
      </div>

      {/* Hazards Selection Form */}
      <Box>
        <FormControl component="fieldset" fullWidth margin="normal" sx={{ pl: 4, pr: 4 }}>
          {/*<FormLabel component="legend">Select Hazard Types</FormLabel>*/}
          <FormGroup>
            {hazardTypes.map((hazard) => (
              <Box key={hazard} sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!selectedHazards[hazard]}
                      onChange={handleHazardChange}
                      name={hazard}
                      disabled={readOnly}
                    />
                  }
                  label={hazard}
                />

                {hazard === 'Others' && selectedHazards['Others'] && (
                  <TextField
                    size="small"
                    label="Please specify"
                    variant="outlined"
                    value={otherHazardText}
                    onChange={handleOtherHazardChange}
                    sx={{ ml: 2, flexGrow: 1 }}
                    disabled={readOnly}
                  />
                )}
              </Box>
            ))}
          </FormGroup>
        </FormControl>

        <div className={styles.flexCenter} style={{ gap: '1rem', marginTop: '2rem' }}>
          <ReturnToTasksBtn />
          {/*<Button*/}
          {/*  type="submit"*/}
          {/*  variant="contained"*/}
          {/*  color="primary"*/}
          {/*  sx={{ mt: 2, mx: 1 }}*/}
          {/*  disabled={readOnly}*/}
          {/*>*/}
          {/*  Save*/}
          {/*</Button>*/}
        </div>

      </Box>
    </div>
  )
}

export default SARTaskStep2
