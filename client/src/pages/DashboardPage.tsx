import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  IconButton,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import PieChartIcon from '@mui/icons-material/PieChart'
import BarChartIcon from '@mui/icons-material/BarChart'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useNavigate } from 'react-router-dom'
import ChartDisplay from '../components/ChartDisplay'
import request from '../utils/request'

interface Chart {
  _id: string
  name: string
  type: 'Pie' | 'Bar' | 'Line'
  dataType: string
  startDate?: string
  endDate?: string
}

const chartIcon = (type: Chart['type']) => {
  switch (type) {
    case 'Bar':
      return <BarChartIcon color="primary" />
    case 'Line':
      return <ShowChartIcon color="primary" />
    case 'Pie':
      return <PieChartIcon color="primary" />
  }
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const [charts, setCharts] = useState<Chart[]>([])
  const [selectedChart, setSelectedChart] = useState<Chart | null>(null)

  useEffect(() => {
    const fetchCharts = async () => {
      const uid = localStorage.getItem('uid')
      if (!uid) return

      try {
        const res = await request(`/api/charts/user/${uid}`)
        setCharts(res.charts)
      } catch (err) {
        console.error('Failed to load charts:', err)
      }
    }

    fetchCharts()
  }, [])

  const handleAddChart = () => {
    navigate('/create-chart')
  }

  const handleBack = () => {
    setSelectedChart(null)
  }

  const handleEditChart = (chartId: string) => {
    localStorage.setItem('editChartId', chartId)
    navigate('/create-chart')
  }


  return (
    <Box display="flex" flexDirection="column" padding="16px">
      {selectedChart === null ? (
        <>
          <Typography mb={2} ml={1} mr={1}>
            Start customizing your dashboard by selecting the '+' sign below to add a new chart.
          </Typography>

          <Box
            sx={{
              width: '100%',
              maxHeight: '70vh',
              overflowY: 'auto',
              overflowX: 'hidden',
              pt: 1,
              pr: 1,
              pl: 1,
              pb: 2,
            }}
          >
            <Grid container spacing={2} justifyContent="center">
              {charts.map((chart) => (
                <Grid item xs={12} md={10} key={chart._id}>
                  <Card
                    elevation={3}
                    onClick={() => setSelectedChart(chart)}
                    sx={{
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center">
                          {chartIcon(chart.type)}
                          <Typography variant="h6" ml={1}>
                            {chart.name}
                          </Typography>
                        </Box>
                        <Chip label={chart.type} size="small" color="primary" variant="outlined" />
                      </Box>
                      <Typography variant="body2" mt={1}>
                        Data: {chart.dataType}
                      </Typography>
                      <Typography variant="body2">
                        Period: {chart.startDate?.slice(0, 10)} to {chart.endDate?.slice(0, 10)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box mt={3} display="flex" justifyContent="center">
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddChart}
              sx={{ borderRadius: '999px' }}
            >
              Add Chart
            </Button>
          </Box>
        </>
      ) : (
        <>
          <Box display="flex" alignItems="center" mb={2} justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <IconButton onClick={handleBack}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6" ml={1}>
                {selectedChart.name}
              </Typography>
            </Box>
            <Button onClick={() => handleEditChart(selectedChart._id)}>Edit</Button>
          </Box>

          <ChartDisplay
            chartId={selectedChart._id}
          />
        </>
      )}
    </Box>
  )
}

export default DashboardPage
