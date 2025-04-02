import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
} from 'chart.js'
import { Pie, Bar, Line } from 'react-chartjs-2'
import { useNavigate } from 'react-router'
import request from '../utils/request'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title
)

type ChartType = 'Pie' | 'Bar' | 'Line'

interface Dataset {
  label: string
  data: number[]
}

interface ChartDisplayProps {
  chartId: string
}

const colors = ['#1976d2', '#ff9800', '#4caf50', '#03a9f4', '#f44336', '#9c27b0']

const ChartDisplay: React.FC<ChartDisplayProps> = ({ chartId }) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [chartType, setChartType] = useState<ChartType>('Pie')
  const [title, setTitle] = useState('')
  const [labels, setLabels] = useState<string[]>([])
  const [datasets, setDatasets] = useState<Dataset[]>([])

  useEffect(() => {
    const fetchChart = async () => {
      try {
        const res = await request(`/api/charts/${chartId}`)
        setTitle(res.title)
        setChartType(res.chartType)
        setLabels(res.labels)
        setDatasets(res.datasets)
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch chart:', err)
        navigate('/dashboard')
      }
    }

    fetchChart()
  }, [chartId, navigate])

  const renderChart = () => {
    if (chartType === 'Pie') {
      return (
        <Pie
          data={{
            labels,
            datasets: [
              {
                data: datasets[0]?.data || [],
                backgroundColor: colors.slice(0, labels.length),
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom',
              },
            },
          }}
        />
      )
    }

    if (chartType === 'Line') {
      return (
        <Line
          data={{
            labels,
            datasets: datasets.map((ds, idx) => ({
              label: ds.label,
              data: ds.data,
              borderColor: colors[idx % colors.length],
              fill: false,
              tension: 0.3,
            })),
          }}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom',
              },
            },
          }}
        />
      )
    }

    if (chartType === 'Bar') {
      return (
        <Bar
          data={{
            labels,
            datasets: datasets.map((ds, idx) => ({
              label: ds.label,
              data: ds.data,
              backgroundColor: colors[idx % colors.length],
            })),
          }}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom',
              },
            },
          }}
        />
      )
    }

    return <Typography textAlign="center">Unsupported chart type</Typography>
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box width="100%" maxWidth={600} mx="auto">
      <Typography variant="h6" fontWeight="bold" textAlign="center" mb={2}>
        {title}
      </Typography>
      {renderChart()}
    </Box>
  )
}

export default ChartDisplay
