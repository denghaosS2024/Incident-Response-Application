import {
    DirectionsCar,
    Flag,
    LocalHospital,
    LocalPolice,
    LocalShipping,
    Person,
    PriorityHigh,
} from '@mui/icons-material'
import { Box, Typography } from '@mui/material'
import getRoleIcon from '../common/RoleIcon'
import StepIndicator from '../common/StepIndicator'
type IncidentStateHistoryItem = {
    state: string
    commander?: string
    timestamp: string
    role: string
    incidentState: string
}
type AssignHistoryItem = {
    name: string
    type: string
    isAssign: boolean
    usernames: string[]
    timestamp: string
    user?: {
        username: string
        role: string
    } | null
}

type Incident = {
    assignHistory: AssignHistoryItem[]
    openingDate: string
    closingDate: string
    commander: string
    commanderDetail?: {
        username: string
        role: string
    }
    priority: string
    patientName?: string
    incidentStateHistory: IncidentStateHistoryItem[]
}

type Step5ResponseTimelineProps = {
    incident: Incident
}

const typeIconMap: Record<string, JSX.Element> = {
    Car: <DirectionsCar />,
    Truck: <LocalShipping />,
    Ambulance: <LocalHospital />,
    Police: <LocalPolice />,
    Person: <Person />,
    Priority: <PriorityHigh />,
    Flag: <Flag />,
}

const Step5ResponseTimeline: React.FC<Step5ResponseTimelineProps> = ({
    incident,
}) => {
    const {
        assignHistory = [],
        openingDate,
        closingDate,
        commander,
        commanderDetail,
        priority,
        patientName,
        incidentStateHistory = [],
    } = incident
    const assignedItems = assignHistory.filter((item) => item.isAssign)
    const unassignedItems = assignHistory.filter((item) => !item.isAssign)
    const stateTimelineItems = incidentStateHistory.map((historyItem) => ({
        icon: typeIconMap.Flag,
        label: `Open ${historyItem.incidentState}`,
        subtext: [
            <span key={historyItem.commander}>
                Commander:
                {getRoleIcon(historyItem.role)}
                {historyItem.commander || 'Unknown'}
            </span>,
        ],
        time: formatTime(historyItem.timestamp),
    }))

    const timelineItems = [
        {
            icon: typeIconMap.Flag,
            label: 'Open Waiting',
            time: formatTime(openingDate),
        },
        ...stateTimelineItems,
        ...assignedItems.map((item) => ({
            icon: typeIconMap[item.type] || typeIconMap.Flag,
            label: `${capitalize(item.name)} assigned`,
            subtext: item.user ? [`${item.user.username}`] : item.usernames,
            time: formatTime(item.timestamp),
            role: item.user?.role,
        })),
        {
            icon: typeIconMap.Police,
            label: 'Commander:',
            subtext: commanderDetail
                ? [`${commanderDetail.username}`]
                : [commander],
            time: formatTime(openingDate),
            role: commanderDetail?.role,
        },
        {
            icon: typeIconMap.Priority,
            label: `Priority: ${priority}`,
            time: formatTime(openingDate),
        },
        ...(patientName
            ? [
                  {
                      icon: typeIconMap.Person,
                      label: 'Patient treated on road',
                      subtext: [`Name: ${patientName}`],
                      time: formatTime(openingDate),
                  },
                  {
                      icon: typeIconMap.Person,
                      label: 'Patient at the ER',
                      subtext: [`Name: ${patientName}`],
                      time: formatTime(openingDate),
                  },
              ]
            : []),
        ...unassignedItems.map((item) => ({
            icon: typeIconMap[item.type] || typeIconMap.Flag,
            label: `${capitalize(item.name)} unassigned`,
            subtext: item.user ? [`${item.user.username}`] : item.usernames,
            time: formatTime(item.timestamp),
            role: item.user?.role,
        })),
        {
            icon: typeIconMap.Flag,
            label: 'Close',
            time: formatTime(closingDate),
        },
    ]

    return (
        <Box sx={{ mt: 3, mb: 4 }}>
            <StepIndicator currentStep={5} totalSteps={5} />
            <Typography variant="h5" align="center" mb={3}>
                Response Timeline
            </Typography>

            <Box display="flex" flexDirection="column" gap={3}>
                {timelineItems.map((item, idx) => (
                    <Box
                        key={idx}
                        display="flex"
                        gap={2}
                        alignItems="flex-start"
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 28,
                                height: 28,
                                mt: '4px',
                            }}
                        >
                            {item.icon}
                        </Box>

                        <Box
                            sx={{
                                width: '2px',
                                backgroundColor: '#ccc',
                                height: '100%',
                                mt: '4px',
                            }}
                        />

                        <Box>
                            <Typography fontSize="14px" fontWeight={600}>
                                {item.label}
                            </Typography>

                            {item.subtext?.map((sub, i) => (
                                <Box
                                    key={i}
                                    display="flex"
                                    alignItems="center"
                                    gap={0.5}
                                    mt={0.5}
                                >
                                    {item.role
                                        ? getRoleIcon(item.role)
                                        : renderIconByLabel(item.label)}
                                    <Typography fontSize="14px">
                                        {sub}
                                    </Typography>
                                </Box>
                            ))}

                            <Typography fontSize="12px" color="gray">
                                {item.time}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    )
}

function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

function formatTime(timestamp: string) {
    const date = new Date(timestamp)
    return date
        .toLocaleString('en-GB', {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        })
        .replace(',', '')
}

function renderIconByLabel(label: string) {
    if (label.toLowerCase().includes('car')) {
        return <DirectionsCar sx={{ fontSize: 16, color: 'red' }} />
    }
    if (label.toLowerCase().includes('truck')) {
        return <LocalHospital sx={{ fontSize: 16, color: 'red' }} />
    }
    if (label.toLowerCase().includes('commander')) {
        return <LocalPolice sx={{ fontSize: 16, color: 'red' }} />
    }
    if (label.toLowerCase().includes('patient')) {
        return <Person sx={{ fontSize: 16, color: 'gray' }} />
    }
    return null
}

export default Step5ResponseTimeline
