import React from 'react';
import { 
    Box, 
    Typography, 
    Card,
    CardActionArea
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../app/store';
import { updateIncident } from '../../features/incidentSlice';
import { RootState } from '../../utils/types';
import IIncident, { IncidentType } from '../../models/Incident';

// Icons for emergency types
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';

const Reach911Step2: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const incident: IIncident = useSelector((state: RootState) => state.incidentState.incident);
    
    const handleTypeSelection = (type: IncidentType) => {
        dispatch(updateIncident({
            ...incident,
            type: type
        }));
    };

    // Helper function to determine if a card is selected
    const isSelected = (type: IncidentType) => incident.type === type;

    return (
        <Box sx={{ 
            height: '100%',
            maxHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            px: 2,
            pb: 1,
            boxSizing: 'border-box',
            mt: '10px',
            p: '10px'
        }}>
            <Box>
                <Typography variant="h6" align="center" sx={{ mb: 0.5 }}>
                    What type of emergency are you experiencing?
                </Typography>
            </Box>
            
            <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                width: '100%',
                flex: 1,
                overflow: 'hidden',
                my: 0.5
            }}>
                {/* Fire Emergency Card */}
                <Card 
                    elevation={isSelected(IncidentType.Fire) ? 4 : 1}
                    sx={{ 
                        border: isSelected(IncidentType.Fire) ? '1.5px solid #f44336' : '1.5px solid #dddddd',
                        transition: 'all 0.3s ease',
                        maxHeight: '28%',
                        boxShadow: 'none'
                    }}
                >
                    <CardActionArea 
                        onClick={() => handleTypeSelection(IncidentType.Fire)}
                        sx={{ display: 'flex', justifyContent: 'center', py: 1 }}
                    >
                        <Box sx={{ 
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '100%'
                        }}>
                            <LocalFireDepartmentIcon 
                                sx={{ 
                                    fontSize: 36, 
                                    color: '#f44336',
                                    mb: 0.25
                                }} 
                            />
                            <Typography variant="subtitle1" align="center" sx={{ fontWeight: 'medium', fontSize: '1rem', lineHeight: 1.2 }}>
                                Fire
                            </Typography>
                            <Typography variant="caption" color="text.secondary" align="center" sx={{ fontSize: '0.85rem', lineHeight: 1.2 }}>
                                Report a fire emergency
                            </Typography>
                        </Box>
                    </CardActionArea>
                </Card>

                {/* Medical Emergency Card */}
                <Card 
                    elevation={isSelected(IncidentType.Medical) ? 4 : 1}
                    sx={{ 
                        border: isSelected(IncidentType.Medical) ? '1.5px solid #2196f3' : '1.5px solid #dddddd',
                        transition: 'all 0.3s ease',
                        maxHeight: '28%',
                        boxShadow: 'none'
                    }}
                >
                    <CardActionArea 
                        onClick={() => handleTypeSelection(IncidentType.Medical)}
                        sx={{ display: 'flex', justifyContent: 'center', py: 1 }}
                    >
                        <Box sx={{ 
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '100%'
                        }}>
                            <LocalHospitalIcon 
                                sx={{ 
                                    fontSize: 36, 
                                    color: '#2196f3',
                                    mb: 0.25
                                }} 
                            />
                            <Typography variant="subtitle1" align="center" sx={{ fontWeight: 'medium', fontSize: '1rem', lineHeight: 1.2 }}>
                                Medical
                            </Typography>
                            <Typography variant="caption" color="text.secondary" align="center" sx={{ fontSize: '0.85rem', lineHeight: 1.2 }}>
                                Report a medical emergency
                            </Typography>
                        </Box>
                    </CardActionArea>
                </Card>

                {/* Police Emergency Card */}
                <Card 
                    elevation={isSelected(IncidentType.Police) ? 4 : 1}
                    sx={{ 
                        border: isSelected(IncidentType.Police) ? '1.5px solid #4caf50' : '1.5px solid #dddddd',
                        transition: 'all 0.3s ease',
                        maxHeight: '28%',
                        boxShadow: 'none',
                    }}
                >
                    <CardActionArea 
                        onClick={() => handleTypeSelection(IncidentType.Police)}
                        sx={{ display: 'flex', justifyContent: 'center', py: 1 }}
                    >
                        <Box sx={{ 
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '100%'
                        }}>
                            <LocalPoliceIcon 
                                sx={{ 
                                    fontSize: 36, 
                                    color: '#4caf50', 
                                    mb: 0.25
                                }} 
                            />
                            <Typography variant="subtitle1" align="center" sx={{ fontWeight: 'medium', fontSize: '1rem', lineHeight: 1.2 }}>
                                Police
                            </Typography>
                            <Typography variant="caption" color="text.secondary" align="center" sx={{ fontSize: '0.85rem', lineHeight: 1.2 }}>
                                Report a police emergency
                            </Typography>
                        </Box>
                    </CardActionArea>
                </Card>
            </Box>
            
            {incident.type !== IncidentType.Unset && (
                <Typography variant="body2" align="center" sx={{ fontWeight: 'bold', fontSize: '1rem', lineHeight: 1.2, p: '10px' }}>
                    You've selected: {incident.type === IncidentType.Fire 
                        ? 'Fire' 
                        : incident.type === IncidentType.Medical 
                            ? 'Medical' 
                            : 'Police'} emergency
                </Typography>
            )}
        </Box>
    );
};

export default Reach911Step2; 