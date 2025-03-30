import React from 'react'
import {
  Box,
  Button,
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
import { useNavigate } from 'react-router-dom'

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

interface ChartDisplayProps {
  title: string
  chartType: ChartType
  labels: string[]
  data: number[] | number[][]
  chartId: string
}

const colors = ['#1976d2', '#ff9800', '#4caf50', '#03a9f4', '#f44336', '#9c27b0']

const ChartDisplay: React.FC<ChartDisplayProps> = ({ title, chartType, labels, data, chartId}) => {
  
  const navigate = useNavigate()
  const handleEdit = () => {
    localStorage.setItem('editChartId', chartId)
    navigate('/create-chart')
  }
  const renderChart = () => {
    if (chartType === 'Pie') {
      return (
        <Pie
          data={{
            labels,
            datasets: [
              {
                data: data as number[],
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

    if (chartType === 'Bar') {
      return (
        <Bar
          data={{
            labels,
            datasets: (data as number[][]).map((dayData, idx) => ({
              label: `Day ${idx + 1}`,
              data: dayData,
              backgroundColor: colors[idx % colors.length],
            })),
          }}
          options={{
            responsive: true,
            indexAxis: 'y',
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
            datasets: (data as number[][]).map((dayData, idx) => ({
              label: ['Fire', 'Police', 'Medical', 'SAR'][idx],
              data: dayData,
              fill: false,
              borderColor: colors[idx % colors.length],
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

    return <div>Unsupported chart type</div>
  }

  return (
    <div style={{ width: '100%', maxWidth: 500, margin: '0 auto' }}>
      {renderChart()}
    </div>
  )
}

export default ChartDisplay
