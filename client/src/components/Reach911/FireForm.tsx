import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material'

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import IIncident from '../../models/Incident'
import { loadContacts } from '../../redux/contactSlice'
import { updateIncident } from '../../redux/incidentSlice'
import { AppDispatch } from '../../redux/store'
import { FireQuestions, RootState } from '../../utils/types'

const FireForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const incident: IIncident = useSelector(
    (state: RootState) => state.incidentState.incident,
  )
  const fireQuestions = (incident.questions as FireQuestions) ?? {}

  const fireType = fireQuestions.fireType ?? ''
  const hasSmoke = fireQuestions.hasSmoke ?? false
  const hasFlames = fireQuestions.hasFlames ?? false
  const hasHazards = fireQuestions.hasHazards ?? false
  const numPeople = fireQuestions.numPeople ?? 0
  const otherDetails = fireQuestions.otherDetails ?? ''

  const [numPeopleError, setnumPeopleError] = useState<string>('')

  useEffect(() => {
    dispatch(loadContacts())
  }, [dispatch])

  const onChange = (
    field: string,
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>,
  ) => {
    const { value } = e.target as HTMLInputElement

    dispatch(
      updateIncident({
        ...incident,
        questions: {
          ...(incident.questions ?? {}),
          [field]: value,
        } as FireQuestions,
      }),
    )

    // Validate only the changed field
    validateField(field, value)
  }

  const validateField = (field: string, value: string) => {
    if (field === 'numPeople') {
      const parsedValue = Number(value)

      if (parsedValue && parsedValue <= 0) {
        setnumPeopleError('Enter a positive number')
      } else {
        setnumPeopleError('')
      }
    }
  }

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        paddingX="32px"
      >
        <Box width="100%" maxWidth="500px" my={2}>
          <FormControl>
            <FormLabel id="fireType-label">
              Is it a structure fire or wildfire?
            </FormLabel>
            <RadioGroup
              row
              aria-labelledby="fireType-label"
              name="fireType-radio-buttons-group"
              value={fireType}
              onChange={(e) => onChange('fireType', e)}
            >
              <FormControlLabel
                value="structure fire"
                control={<Radio />}
                label="Structure fire"
              />
              <FormControlLabel
                value="wildfire"
                control={<Radio />}
                label="Wildfire"
              />
            </RadioGroup>
          </FormControl>
        </Box>

        <Box width="100%" maxWidth="500px" my={2}>
          <FormControl>
            <FormLabel id="hasSmoke-label">Do you smell smoke?</FormLabel>
            <RadioGroup
              row
              aria-labelledby="hasSmoke-label"
              name="hasSmoke-radio-buttons-group"
              value={hasSmoke}
              onChange={(e) => onChange('hasSmoke', e)}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Box>

        <Box width="100%" maxWidth="500px" my={2}>
          <FormControl>
            <FormLabel id="hasFlames-label">Do you see flames?</FormLabel>
            <RadioGroup
              row
              aria-labelledby="hasFlames-label"
              name="hasFlames-radio-buttons-group"
              value={hasFlames}
              onChange={(e) => onChange('hasFlames', e)}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Box>

        <Box width="100%" maxWidth="500px" my={2}>
          <FormControl>
            <FormLabel id="hasHazards-label">
              Are there any hazardous materials present?
            </FormLabel>
            <RadioGroup
              row
              aria-labelledby="hasHazards-label"
              name="hasHazards-radio-buttons-group"
              value={hasHazards}
              onChange={(e) => onChange('hasHazards', e)}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>
        </Box>

        <Box
          sx={{
            display: 'flex',
            maxWidth: '500px',
            width: '100%',
            alignItems: 'start',
            color: 'rgba(0, 0, 0, 0.6)',
          }}
        >
          {' '}
          {/**TODO: Add colors to style guide */}
          <Typography>
            What is the number of people within the fire perimeter?
          </Typography>
        </Box>

        <Box width="100%" maxWidth="500px" my={2}>
          <TextField
            variant="outlined"
            label="Number of people"
            fullWidth
            value={numPeople}
            type="number"
            error={!!numPeopleError}
            helperText={numPeopleError}
            InputProps={{
              inputProps: {
                max: 999,
                min: 1,
              },
            }}
            onChange={(e) => onChange('numPeople', e)}
          />
        </Box>

        <Box width="100%" maxWidth="500px" my={2}>
          <TextField
            variant="outlined"
            label="Other Details"
            fullWidth
            multiline
            value={otherDetails}
            onChange={(e) => onChange('otherDetails', e)}
          />
        </Box>
      </Box>
    </>
  )
}

export default FireForm
