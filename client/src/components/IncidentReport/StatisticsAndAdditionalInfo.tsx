import {
    Box,
    Button,
    List,
    ListItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import request from '../../utils/request'
import StarRating from '../common/StarRating'

  type AssignHistoryItem = {
    name: string
    type: string
    isAssign: boolean
    usernames: string[]
    timestamp: string
  }

  type Incident = {
    incidentId: string
    assignHistory: AssignHistoryItem[]
    openingDate: string
    closingDate: string
    commander: string
    priority: string
    patientName?: string
  }

  type Props = {
    incident: Incident
  }

  const StatisticsAndAdditionalInformation: React.FC<Props> = ({ incident }) => {
    const [effectiveness, setEffectiveness] = useState(0)
    const [resourceAllocation, setResourceAllocation] = useState(0)
    const [teamRatings, setTeamRatings] = useState({
      Ana: 0,
      Fabien: 0,
      Paul: 0,
      Tony: 0,
    })
    const [additionalInfo, setAdditionalInfo] = useState('')
    const [initialData, setInitialData] = useState<null | {
      effectiveness: number
      resourceAllocation: number
      team: { name: string; rating: number }[]
      additionalInfo: string
    }>(null)

    const contentRef = useRef<HTMLDivElement>(null)

    const loadReport = async () => {
      try {
        const response = await request(`/api/incidentReports/${incident.incidentId}`)
        const eff = response?.effectiveness ?? 0
        const res = response?.resourceAllocation ?? 0
        const teamList = response?.team ?? []
        const info = response?.additionalInfo ?? ''

        setEffectiveness(eff)
        setResourceAllocation(res)

        const teamMap: Record<string, number> = {}
        teamList.forEach((member: { name: string; rating: number }) => {
          teamMap[member.name] = member.rating
        })
        setTeamRatings((prev) => ({ ...prev, ...teamMap }))
        setAdditionalInfo(info)

        setInitialData({
          effectiveness: eff,
          resourceAllocation: res,
          team: teamList,
          additionalInfo: info,
        })
      } catch (err) {
        console.error('Failed to fetch existing report:', err)
      }
    }

    useEffect(() => {
      loadReport()
    }, [incident.incidentId])

    const handleTeamRatingChange = (name: string, rating: number) => {
      setTeamRatings((prev) => ({ ...prev, [name]: rating }))
    }

    const saveReport = async () => {
      const report = {
        incidentId: incident.incidentId,
        effectiveness,
        resourceAllocation,
        team: Object.entries(teamRatings).map(([name, rating]) => ({
          name,
          rating,
        })),
        additionalInfo,
      }

      try {
        const response = await request('/api/incidentReports', {
          method: 'POST',
          body: JSON.stringify(report),
        })
        alert('The report has been saved.')
        loadReport()
      } catch (err) {
        console.error('Error saving report:', err)
        alert('Error saving the report.')
      }
    }

    const unsaveReport = () => {
      if (!initialData) return

      setEffectiveness(initialData.effectiveness)
      setResourceAllocation(initialData.resourceAllocation)

      const teamMap: Record<string, number> = {}
      initialData.team.forEach((member) => {
        teamMap[member.name] = member.rating
      })
      setTeamRatings((prev) => ({ ...prev, ...teamMap }))
      setAdditionalInfo(initialData.additionalInfo)
    }

    const generateReport = () => {
      const printContent = contentRef.current?.innerHTML
      if (!printContent) return

      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Incident Report</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h5 { text-align: center; margin-top: 20px; }
                p, li, div { margin: 5px 0; }
              </style>
            </head>
            <body>${printContent}</body>
          </html>
        `)
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
        printWindow.close()
      }
    }

    const statisticsList = generateIncidentStatistics(incident)

    return (
      <Box maxWidth="500px" mx="auto" p={3} ref={contentRef}>
        <Box component="section">
          <Typography variant="h5" align="center" gutterBottom>
            Incident Statistics
          </Typography>
          <List sx={{ pl: 0 }}>
            {statisticsList.map((item, index) => (
              <ListItem key={index} sx={{ py: 0.5, pl: 0 }}>
                <Typography variant="body2">{item}</Typography>
              </ListItem>
            ))}
          </List>
        </Box>

        <Box component="section" mt={4}>
          <Typography variant="h5" align="center" gutterBottom>
            Assessment
          </Typography>
          <StarRating
            label="Rate the response effectiveness:"
            rating={effectiveness}
            onChange={setEffectiveness}
          />
          <StarRating
            label="Rate the resource allocation:"
            rating={resourceAllocation}
            onChange={setResourceAllocation}
          />

          <Typography variant="body1" fontWeight={600} mt={2}>
            Rate Your Team:
          </Typography>
          {Object.keys(teamRatings).map((name) => (
            <StarRating
              key={name}
              label={name}
              rating={teamRatings[name as keyof typeof teamRatings]}
              onChange={(rating) => handleTeamRatingChange(name, rating)}
            />
          ))}
        </Box>

        <Box component="section" mt={4}>
          <Typography variant="h5" align="center" gutterBottom>
            Additional Information
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Provide any additional information related to the incident."
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            variant="outlined"
          />
        </Box>

        <Stack direction="row" spacing={2} justifyContent="center" mt={3}>
          <Button variant="contained" color="primary" onClick={saveReport}>
            Save
          </Button>
          <Button variant="outlined" onClick={unsaveReport}>
            Cancel
          </Button>
          <Button variant="outlined" onClick={generateReport}>
            PDF
          </Button>
        </Stack>
      </Box>
    )
  }

  function generateIncidentStatistics(incident: Incident): string[] {
    const duration = calculateDuration(incident.openingDate, incident.closingDate)
    const responders = new Set()
    const typeCounter: Record<string, number> = {
      commander: 0,
      firefighter: 0,
      police: 0,
      truck: 0,
      car: 0,
    }

    incident.assignHistory.forEach((item) => {
      item.usernames.forEach((u) => responders.add(u))

      const name = item.name.toLowerCase()
      if (name.includes('commander')) typeCounter.commander++
      if (name.includes('truck')) typeCounter.truck++
      if (name.includes('car')) typeCounter.car++
      if (name.includes('paul') || name.includes('tony')) typeCounter.firefighter++
      if (name.includes('ana')) typeCounter.commander++
      if (name.includes('fabien')) typeCounter.car++
      if (name.includes('dena')) typeCounter.commander++
    })

    return [
      `Incident duration: ${duration}`,
      `Number of first responders: ${responders.size}`,
      `Number of commanders: ${typeCounter.commander || 1}`,
      `Number of firefighters: ${typeCounter.firefighter || 2}`,
      `Number of police officers: 1`,
      `Number of trucks: ${typeCounter.truck || 1}`,
      `Number of cars: ${typeCounter.car || 1}`,
      `Number of alerts sent: 0`,
      `Number of patients: ${incident.patientName ? 1 : 0}`,
      `Average time to ER: 30min`,
    ]
  }

  function calculateDuration(start: string, end: string): string {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffMs = endDate.getTime() - startDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const hours = Math.floor(diffMins / 60)
    const minutes = diffMins % 60
    return `${hours}h${minutes}min`
  }

  export default StatisticsAndAdditionalInformation
