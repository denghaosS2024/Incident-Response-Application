import request, { IRequestError } from "@/utils/request.ts"
import { Box, Button, Grid, Link, TextField, Typography } from '@mui/material'
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { useSearchParams } from "react-router-dom"
import IIncident from '../../../models/Incident.ts'
import styles from '../../../styles/SARTaskPage.module.css'
import AddressBar from './AddressBar.tsx'
import ReturnToTasksBtn from './ReturnToTasksBtn.tsx'
import SARTaskTitle from './SARTaskTitle.tsx'

const categories = ['Immediate', 'Urgent', 'Could Wait', 'Dismiss', 'Deceased']

interface SARTaskStep3Props {
  incident?: IIncident | null
  setIncident: (incident: IIncident) => void
}

const SARTaskStep3: React.FC<SARTaskStep3Props> = ({ incident, setIncident }) => {
  const [searchParams] = useSearchParams()
  const taskId = parseInt(searchParams.get('taskId') || '0')
  const [counts, setCounts] = useState<number[]>(categories.map(() => 0))
  const [readOnly, setReadOnly] = useState(false)
  const [allowTreatVictim, setAllowTreatVictim] = useState(true)

  useEffect(() => {
    if (incident === null || incident?.sarTasks === null) return
    const victims = incident?.sarTasks?.at(taskId)?.victims || categories.map(() => 0)
    setCounts(victims)

    setReadOnly(incident?.sarTasks?.at(taskId)?.state === 'Done')

    if (victims.length === categories.length) {
      setAllowTreatVictim(victims[0] > 0 || victims[1] > 0 || victims[2] > 0)
    }
  }, [incident]);

  const handleCountChange = (index: number, value: string) => {
    const newCounts = [...counts]
    // Ensure value is a non-negative integer
    newCounts[index] = Math.max(0, parseInt(value) || 0)
    setCounts(newCounts)
    // console.log(newCounts)

    if (newCounts.length === categories.length) {
      setAllowTreatVictim(newCounts[0] > 0 || newCounts[1] > 0 || newCounts[2] > 0)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const updateSARTask = async (victims: number[]) => {
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
                victims: victims,
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

    event.preventDefault()

    console.log('Submitting victim counts:', counts)
    updateSARTask(counts).then()
  }

  return (
    <div className={styles.wrapperStep}>
      <AddressBar task={incident?.sarTasks?.at(taskId)}/>
      <div className="mt-2"></div> {/* add space between components */}
      <SARTaskTitle
        title={'Victims'}
        subtitle={'Enter the number of victims:'}
      />

      {/* Victim Form */}
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ px: 4 }}>
        {categories.map((category, index) => (
          <Grid
            container
            spacing={2}
            alignItems="center"
            key={category}
            sx={{ mb: 2 }}
          >
            <Grid item xs={2}>
              <TextField
                // fullWidth
                // label="Count"
                type="number"
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  inputMode: 'numeric',
                  min: 0,
                  step: 1,
                  style: { textAlign: 'center' }
                }}
                value={counts[index]}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleCountChange(index, e.target.value)}
                variant="outlined"
                size="medium"
                disabled={readOnly}
              />
            </Grid>
            <Grid item xs={8}>
              <Typography variant="body1">
                {category}
              </Typography>
            </Grid>
          </Grid>
        ))}

        <div className={styles.flexCenter} style={{ gap: '1rem', marginTop: '2rem' }}>
          <ReturnToTasksBtn />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={readOnly}
            sx={{ mt: 2, mx: 1 }}
          >
            Save
          </Button>
          <Button
            component={Link}
            href='/patients/admit'
            className={styles.primaryBtn}
            variant="contained"
            disabled={readOnly || !allowTreatVictim}
            sx={{ mt: 2, mx: 1 }}
          >
            Treat Victims
          </Button>
        </div>
      </Box>

    </div>
  )
}

export default SARTaskStep3
