import React from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import PieChartIcon from '@mui/icons-material/PieChart'
import BarChartIcon from '@mui/icons-material/BarChart'
import ShowChartIcon from '@mui/icons-material/ShowChart'

type ChartType = 'Bar' | 'Line' | 'Pie'

interface Chart {
  name: string
  type: ChartType
  data: string
  period?: number // in days
}

const chartIcon = (type: ChartType) => {
  switch (type) {
    case 'Bar':
      return <BarChartIcon color="primary" />
    case 'Line':
      return <ShowChartIcon color="primary" />
    case 'Pie':
      return <PieChartIcon color="primary" />
  }
}

const mockCharts: Chart[] = [
  {
    name: 'Incident Type',
    type: 'Pie',
    data: 'Incident Type',
  },
  {
    name: 'Incident Type',
    type: 'Line',
    data: 'Incident Type',
    period: 3,
  },
  {
    name: 'Incident Type',
    type: 'Bar',
    data: 'Incident Type',
    period: 3,
  },
  {
    name: 'Incident Type',
    type: 'Pie',
    data: 'Incident Type',
  },
  {
    name: 'Incident Type',
    type: 'Line',
    data: 'Incident Type',
    period: 3,
  },
  {
    name: 'Incident Type',
    type: 'Bar',
    data: 'Incident Type',
    period: 3,
  },
]

const DashboardPage: React.FC = () => {
  return (
    <Box display="flex" flexDirection="column" padding="16px">

      {/* Description */}
      <Typography mb={2} ml={1} mr={1}>
        Start customizing your dashboard by selecting the '+' sign below to add a new chart.
      </Typography>

      {/* Charts List */}
        <Box
        sx={{
            width: '100%',
            maxHeight: '70vh',
            overflowY: 'auto',
            overflowX: 'hidden',
            pt: 1, // top padding
            pr: 1,
            pl: 1,
            pb: 2,
        }}
        >
        <Grid container spacing={2} justifyContent="center">
            {mockCharts.map((chart, index) => (
            <Grid item xs={12} md={10} key={index}>
                <Card
                elevation={3}
                sx={{
                    borderRadius: 2,
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
                    <Chip
                        label={chart.type}
                        size="small"
                        color="primary"
                        variant="outlined"
                    />
                    </Box>
                    <Typography variant="body2" mt={1}>
                    Data: {chart.data}
                    </Typography>
                    <Typography variant="body2">
                    Period: {chart.period ? `${chart.period} days` : 'Last 3 days (default)'}
                    </Typography>
                </CardContent>
                </Card>
            </Grid>
            ))}
        </Grid>
        </Box>

      {/* Add Chart Button */}
      <Box mt={3} display="flex" justifyContent="center">
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={{ borderRadius: '999px' }}
        >
          Add Chart
        </Button>
      </Box>
    </Box>
  )
}

export default DashboardPage
