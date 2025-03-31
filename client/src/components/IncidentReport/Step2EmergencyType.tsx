import { Box, Paper, Typography } from '@mui/material'
import React from 'react'
import type IIncident from '../../models/Incident'
// 导入SVG图标
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment' // 火灾图标
import LocalPoliceIcon from '@mui/icons-material/LocalPolice' // 警察图标
import MedicalServicesIcon from '@mui/icons-material/MedicalServices' // 医疗图标
import StepIndicator from '../common/StepIndicator'

interface Step2EmergencyTypeProps {
    incidentData: IIncident
}

const Step2EmergencyType: React.FC<Step2EmergencyTypeProps> = ({
    incidentData,
}) => {
    const getEmergencyTypeAndIcon = () => {
        const types: Record<
            string,
            { title: string; icon: JSX.Element; selected: boolean }
        > = {
            F: {
                title: 'Fire Emergency',
                icon: <LocalFireDepartmentIcon />,
                selected: incidentData.type === 'F',
            },
            M: {
                title: 'Medical Emergency',
                icon: <MedicalServicesIcon />,
                selected: incidentData.type === 'M',
            },
            P: {
                title: 'Police Emergency',
                icon: <LocalPoliceIcon />,
                selected: incidentData.type === 'P',
            },
        }

        return Object.values(types)
    }

    const emergencyTypes = getEmergencyTypeAndIcon()

    return (
        <Box sx={{ mt: 4, mb: 4 }}>
            <StepIndicator currentStep={2} totalSteps={5} />

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Emergency type (latest):
            </Typography>

            <Box sx={{ maxWidth: 400 }}>
                {emergencyTypes.map((type, index) => (
                    <Paper
                        key={index}
                        elevation={1}
                        sx={{
                            p: 2,
                            mt: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            bgcolor: type.selected ? '#e0e0e0' : 'white',
                            border: '2px solid #000',
                            borderRadius: 0,
                        }}
                    >
                        <Typography variant="body1">{type.title}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {type.icon}
                        </Box>
                    </Paper>
                ))}
            </Box>
        </Box>
    )
}

export default Step2EmergencyType
