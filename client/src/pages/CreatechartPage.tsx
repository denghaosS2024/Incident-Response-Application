import React, { useState } from 'react'
import {
  Box,
  Button,
  Typography,
  TextField,
  MenuItem,
  Grid,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

type ChartType = 'Bar' | 'Line' | 'Pie'

const chartTypes: ChartType[] = ['Bar', 'Line', 'Pie']
const chartDataOptions = ['Incident Type']

const CreateChartPage: React.FC = () => {
  const [name, setName] = useState('')
  const [type, setType] = useState<ChartType | ''>('')
  const [data, setData] = useState('')
  const [startDay, setStartDay] = useState('')
  const [endDay, setEndDay] = useState('')

  const navigate = useNavigate()

  const handleCancel = () => {
    console.log('Cancel')
    navigate('/dashboard')
  }

  const handleSave = () => {
    const chartInfo = {
      name,
      type,
      data,
      startDay,
      endDay,
    }
    console.log('Saving chart:', chartInfo)
    // Optional: navigate('/dashboard')
  }

  const handleRemove = () => {
    console.log('Remove chart')
    navigate('/dashboard')
  }

  return (
    <Box
      sx={{
        height: '100vh',
        backgroundColor: '#fff',
        display: 'flex',
        marginTop: 5,
        px: 2,
      }}
    >
      <Box width="100%" maxWidth="500px">
        <Typography variant="h6" fontWeight="bold" textAlign="center" mb={4}>
          Create New Chart
        </Typography>

        <Grid container spacing={2}>
          {/* Chart Name */}
          <Grid item xs={12}>
            <TextField
              label="Chart Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
            />
          </Grid>

          {/* Chart Type */}
          <Grid item xs={12}>
            <TextField
              label="Chart Type *"
              select
              value={type}
              onChange={(e) => setType(e.target.value as ChartType)}
              fullWidth
              required
            >
              {chartTypes.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Chart Data */}
          <Grid item xs={12}>
            <TextField
              label="Chart Data *"
              select
              value={data}
              onChange={(e) => setData(e.target.value)}
              fullWidth
              required
            >
              {chartDataOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Period */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight="medium">
              Period (optional)
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Start Day"
              type="date"
              value={startDay}
              onChange={(e) => setStartDay(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="End Day"
              type="date"
              value={endDay}
              onChange={(e) => setEndDay(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>

          {/* Buttons */}
          <Grid item xs={12} marginTop={1}>
            <Box display="flex" justifyContent="space-between" gap={2}>
              <Button
                variant="outlined"
                color="error"
                onClick={handleRemove}
                sx={{ flex: 1, height: '40px' }}
              >
                Remove
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleCancel}
                sx={{ flex: 1, height: '40px' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                disabled={!name || !type || !data}
                onClick={handleSave}
                sx={{ flex: 1, height: '40px' }}
              >
                Save
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default CreateChartPage
