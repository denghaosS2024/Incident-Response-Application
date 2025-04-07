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
import getRoleIcon from '../common/RoleIcon'
import StarRating from '../common/StarRating'

type AssignHistoryItem = {
    name: string
    type: string
    isAssign: boolean
    usernames: string[]
    timestamp: string
    user?: {
        username: string
        role: string
    }
}

type CommanderDetail = {
    username: string
    role: string
}

type Incident = {
    incidentId: string
    assignHistory: AssignHistoryItem[]
    openingDate: string
    closingDate: string
    commanderDetail: CommanderDetail
    priority: string
    patients?: Patient[]
}

type Patient = {
    username: string
    status: string
    dateTime: string
}

type Props = {
    incident: Incident
    readonly?: boolean
}

const StatisticsAndAdditionalInformation: React.FC<Props> = ({
    incident,
    readonly,
}) => {
    const [effectiveness, setEffectiveness] = useState(0)
    const [resourceAllocation, setResourceAllocation] = useState(0)
    const [teamRatings, setTeamRatings] = useState<Record<string, number>>({})
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
            const response = await request(
                `/api/incidentReports/${incident.incidentId}`,
            )
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

    useEffect(() => {
        if (!incident) return
        const teamUsernames = new Set<string>()

        if (incident.commanderDetail?.username) {
            teamUsernames.add(incident.commanderDetail.username)
        }

        incident.assignHistory?.forEach((item) => {
            if (item.user?.username) {
                teamUsernames.add(item.user.username)
            }
        })

        const initialRatings: Record<string, number> = {}
        teamUsernames.forEach((name) => {
            initialRatings[name] = teamRatings[name] || 0
        })

        setTeamRatings(initialRatings)
    }, [incident])

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
            await request('/api/incidentReports', {
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

    const statisticsList = generateIncidentStatistics(incident)

    return (
        <Box sx={{ mt: 3, mb: 4 }} ref={contentRef}>
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
                    onChange={readonly ? undefined : setEffectiveness}
                />
                <StarRating
                    label="Rate the resource allocation:"
                    rating={resourceAllocation}
                    onChange={readonly ? undefined : setResourceAllocation}
                />

                <Typography variant="body1" fontWeight={600} mt={2}>
                    Rate Your Team:
                </Typography>
                {Object.keys(teamRatings).map((name) => (
                    <Box key={name} display="flex" alignItems="center" gap={1}>
                        {getRoleIcon(
                            incident.commanderDetail?.username === name
                                ? incident.commanderDetail.role
                                : incident.assignHistory.find(
                                      (a) => a.user?.username === name,
                                  )?.user?.role ?? '',
                        )}
                        <StarRating
                            label={name}
                            rating={teamRatings[name]}
                            onChange={
                                readonly
                                    ? undefined
                                    : (rating) =>
                                          handleTeamRatingChange(name, rating)
                            }
                        />
                    </Box>
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
                    InputProps={{
                        readOnly: readonly,
                    }}
                />
            </Box>

            {!readonly ? (
                <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="center"
                    mt={3}
                >
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={saveReport}
                    >
                        Save
                    </Button>
                    <Button variant="outlined" onClick={unsaveReport}>
                        Cancel
                    </Button>
                </Stack>
            ) : (
                <Box textAlign="center" mt={3}>
                    <Button variant="outlined" onClick={() => window.close()}>
                        Close
                    </Button>
                </Box>
            )}
        </Box>
    )
}

function generateIncidentStatistics(incident: Incident): string[] {
    const duration = calculateDuration(
        incident.openingDate,
        incident.closingDate,
    )

    const responders = new Map<string, string>()
    const truckNames = new Set<string>()
    const carNames = new Set<string>()

    if (incident.commanderDetail?.username) {
        responders.set(
            incident.commanderDetail.username,
            incident.commanderDetail.role,
        )
    }

    incident.assignHistory?.forEach((item) => {
        if (item.user?.username) {
            responders.set(item.user.username, item.user.role)
        }
        if (item.type === 'Truck') truckNames.add(item.name)
        if (item.type === 'Car') carNames.add(item.name)
    })

    const roleCounter: Record<string, number> = {
        Fire: 0,
        Police: 0,
        Nurse: 0,
        Dispatch: 0,
    }

    responders.forEach((role) => {
        if (role in roleCounter) roleCounter[role]++
    })

    const patientCount = new Set(
        (incident.patients || []).map((p) => p.username).filter(Boolean),
    ).size

    const stats: string[] = [
        `Incident duration: ${duration}`,
        `Number of first responders: ${responders.size}`,
        `Number of commanders: 1`,
        `Number of firefighters: ${roleCounter.Fire}`,
        `Number of police officers: ${roleCounter.Police}`,
        `Number of nurses: ${roleCounter.Nurse}`,
        `Number of trucks: ${truckNames.size}`,
        `Number of cars: ${carNames.size}`,
        `Number of alerts sent: 0`,
        `Number of patients: ${patientCount}`,
    ]

    if (incident.patients && incident.patients.length > 0) {
        const toERDurations = incident.patients
            .filter((p) => p.status === 'to_er' && p.dateTime)
            .map((p) => {
                const patientTime = new Date(p.dateTime).getTime()
                const openingTime = new Date(incident.openingDate).getTime()
                return (patientTime - openingTime) / (1000 * 60)
            })

        if (toERDurations.length > 0) {
            const avgToER =
                toERDurations.reduce((a, b) => a + b, 0) / toERDurations.length
            stats.push(`Average time to ER: ${Math.round(avgToER)}min`)
        }
    }

    return stats
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
