import React, {ChangeEvent, FormEvent, useEffect, useState} from 'react'
import IIncident from '../../../models/Incident.ts'
import styles from '../../../styles/SARTaskPage.module.css'
import AddressBar from './AddressBar.tsx'
import ReturnToTasksBtn from './ReturnToTasksBtn.tsx'
import SARTaskTitle from './SARTaskTitle.tsx'
import {Box, FormControl, FormGroup, FormControlLabel, Checkbox, TextField, Button} from '@mui/material'
import request, {IRequestError} from "@/utils/request.ts";
import {useSearchParams} from 'react-router-dom'

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
  const taskId = parseInt(searchParams.get('taskId') || '0')
  const [selectedHazards, setSelectedHazards] = useState<HazardSelections>({})
  const [otherHazardText, setOtherHazardText] = useState<string>('')
  const [readOnly, setReadOnly] = useState(false)

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

  const handleHazardChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedHazards({
      ...selectedHazards,
      [event.target.name]: event.target.checked
    })
  }

  const handleOtherHazardChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOtherHazardText(event.target.value)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {

    const updateSARTask = async (hazards: string[]) => {
      if (!incident) return
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
        console.log('SAR task updated successfully:', JSON.stringify(response))
        setIncident(response)
      } catch (error) {
        const err = error as IRequestError
        console.error('Error updating SAR task:', err.message)
      }
    }

    event.preventDefault();

    // get hazards from form states
    const hazards = Object.keys(selectedHazards)
      .filter(hazard => selectedHazards[hazard] && hazard !== 'Others')
    if (selectedHazards['Others'] && otherHazardText.trim()) {
      hazards.push(otherHazardText.trim())
    }

    // alert('Form to be submitted: ' + JSON.stringify(hazards))
    updateSARTask(hazards).then()
  }

  return (
    <div className={styles.wrapperStep}>
      <AddressBar address={incident?.sarTasks?.at(taskId)?.location || 'No Address'} />
      <div className="mt-2"></div> {/* add space between components */}

      <SARTaskTitle
        title={'Hazards'}
        subtitle={'Select the hazards you notice:'}
      />

      {/* Hazards Selection Form */}
      <Box component="form" onSubmit={handleSubmit}>
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
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2, mx: 1 }}
            disabled={readOnly}
          >
            Save
          </Button>
        </div>

      </Box>
    </div>
  )
}

export default SARTaskStep2
