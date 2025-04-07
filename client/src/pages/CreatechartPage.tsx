import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Typography,
  TextField,
  MenuItem,
  Grid,
} from '@mui/material'
import { useNavigate } from 'react-router'
import request from '../utils/request'

type ChartType = 'Bar' | 'Line' | 'Pie'

const chartTypes: ChartType[] = ['Bar', 'Line', 'Pie']
const chartDataOptions = [
    'Alert Acknowledgment Time',
    'Fire/Police Alerts',
    'Incident Duration',
    'Incident Priority',
    'Incident Resources',
    'Incident State',
    'Incident Type',
    'Patient Location',
    'SAR Tasks',
    'SAR Victims',
  ]
  
  

const CreateChartPage: React.FC = () => {
  const [name, setName] = useState('')
  const [type, setType] = useState<ChartType | ''>('')
  const [data, setData] = useState('')
  const [startDay, setStartDay] = useState('')
  const [endDay, setEndDay] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const navigate = useNavigate()

  const chartId = localStorage.getItem('editChartId')

  useEffect(() => {
    if (chartId) {
      const fetchChartData = async () => {
        try {
          const chart = await request(`/api/charts/${chartId}`)
          console.log('Chart:', chart)
          setName(chart.title)
          setType(chart.chartType)
          setData(chart.dataType)
          setStartDay(chart.customPeriod?.startDate?.substring(0, 10) ?? '')
          setEndDay(chart.customPeriod?.endDate?.substring(0, 10) ?? '')
        } catch (err) {
          console.error('Failed to fetch chart data:', err)
        }
      }

      fetchChartData()
    }
  }, [chartId])

  const handleCancel = () => {
    localStorage.removeItem('editChartId')
    navigate('/dashboard')
  }

  const handleSave = async () => {
    try {
      const chartPayload = {
        userId: localStorage.getItem('uid'),
        name,
        type,
        dataType: data,
        startDate: startDay ? new Date(startDay).toISOString() : null,
        endDate: endDay ? new Date(endDay).toISOString() : null,
      }

      const res = await request('/api/charts', {
        method: 'POST',
        body: JSON.stringify(chartPayload),
      })

      console.log('Chart saved:', res)
      setMessage(res.message ?? 'Chart created successfully.')
      setMessageType('success')
      navigate('/dashboard')
      localStorage.removeItem('editChartId')
    } catch (err: any) {
      const errorMessage =
        err?.message ?? err?.response?.message ?? 'Failed to save chart.'
      setMessage(errorMessage)
      setMessageType('error')
    }
  }

  const handleUpdate = async () => {
    if (!chartId) return
    try {
      const chartPayload = {
        name,
        type,
        dataType: data,
        startDate: startDay ? new Date(startDay).toISOString() : null,
        endDate: endDay ? new Date(endDay).toISOString() : null,
      }

      const res = await request(`/api/charts/${chartId}`, {
        method: 'PUT',
        body: JSON.stringify(chartPayload),
      })

      console.log('Chart updated:', res)
      navigate('/dashboard')
      localStorage.removeItem('editChartId')
    } catch (err: any) {
        const errorMessage =
          err?.message ?? err?.response?.message ?? 'Failed to update chart.'
        setMessage(errorMessage)
        setMessageType('error')
      }
  }

  const handleRemove = async () => {
    if (!chartId) return
    try {
      await request(`/api/charts/${chartId}`, {
        method: 'DELETE',
      })
      console.log('Chart deleted successfully.')
    } catch (err) {
      console.error('Failed to delete chart:', err)
    }

    localStorage.removeItem('editChartId')
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
          <Grid item xs={12}>
            <TextField
              label="Chart Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Chart Type *"
              select
              value={type}
              onChange={(e) => setType(e.target.value as ChartType)}
              fullWidth
            >
              {chartTypes.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Chart Data *"
              select
              value={data}
              onChange={(e) => setData(e.target.value)}
              fullWidth
            >
              {chartDataOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

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

          {message && messageType === 'error' && (
            <Grid item xs={12}>
              <Box textAlign="center" color="error.main" fontSize="0.9rem" mb={-1}>
                {message}
              </Box>
            </Grid>
          )}

          <Grid item xs={12} marginTop={1}>
            <Box display="flex" justifyContent="space-between" gap={2}>
              {chartId && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleRemove}
                  sx={{ flex: 1, height: '40px' }}
                >
                  Remove
                </Button>
              )}
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleCancel}
                sx={{ flex: 1, height: '40px' }}
              >
                Cancel
              </Button>
              {chartId ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpdate}
                  sx={{ flex: 1, height: '40px' }}
                >
                  Update
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  sx={{ flex: 1, height: '40px' }}
                >
                  Save
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default CreateChartPage
