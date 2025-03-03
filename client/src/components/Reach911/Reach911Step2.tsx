import React from 'react';
import { 
    Box, 
    Typography, 
    Paper,
    Grid,
    Card,
    CardContent,
    CardActionArea
} from '@mui/material';
import styles from '../../styles/Reach911Page.module.css';
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
        <div className={styles.wrapperStep1}>
            <div className={styles.flexCenterColumn}>
                <Typography variant="h6" align="center" gutterBottom>
                    Select Emergency Type
                </Typography>
                <Typography variant="subtitle1" className={styles.bold} align="center" gutterBottom>
                    What type of emergency are you experiencing?
                </Typography>
                
                <Box sx={{ 
                    width: '100%', 
                    maxWidth: '900px', 
                    mt: 4,
                    px: 2
                }}>
                    <Grid container spacing={3} justifyContent="center">
                        {/* Fire Emergency Card */}
                        <Grid item xs={12} sm={4}>
                            <Card 
                                elevation={isSelected(IncidentType.Fire) ? 8 : 2}
                                sx={{ 
                                    height: '100%',
                                    border: isSelected(IncidentType.Fire) ? '2px solid #f44336' : 'none',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <CardActionArea 
                                    onClick={() => handleTypeSelection(IncidentType.Fire)}
                                    sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                                >
                                    <Box sx={{ 
                                        p: 3, 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%'
                                    }}>
                                        <LocalFireDepartmentIcon 
                                            sx={{ 
                                                fontSize: 80, 
                                                color: '#f44336',
                                                mb: 2
                                            }} 
                                        />
                                        <Typography variant="h5" component="div" align="center">
                                            Fire
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                                            Report a fire emergency
                                        </Typography>
                                    </Box>
                                </CardActionArea>
                            </Card>
                        </Grid>

                        {/* Medical Emergency Card */}
                        <Grid item xs={12} sm={4}>
                            <Card 
                                elevation={isSelected(IncidentType.Medical) ? 8 : 2}
                                sx={{ 
                                    height: '100%',
                                    border: isSelected(IncidentType.Medical) ? '2px solid #2196f3' : 'none',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <CardActionArea 
                                    onClick={() => handleTypeSelection(IncidentType.Medical)}
                                    sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                                >
                                    <Box sx={{ 
                                        p: 3, 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%'
                                    }}>
                                        <LocalHospitalIcon 
                                            sx={{ 
                                                fontSize: 80, 
                                                color: '#2196f3',
                                                mb: 2
                                            }} 
                                        />
                                        <Typography variant="h5" component="div" align="center">
                                            Medical
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                                            Report a medical emergency
                                        </Typography>
                                    </Box>
                                </CardActionArea>
                            </Card>
                        </Grid>

                        {/* Police Emergency Card */}
                        <Grid item xs={12} sm={4}>
                            <Card 
                                elevation={isSelected(IncidentType.Police) ? 8 : 2}
                                sx={{ 
                                    height: '100%',
                                    border: isSelected(IncidentType.Police) ? '2px solid #4caf50' : 'none',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <CardActionArea 
                                    onClick={() => handleTypeSelection(IncidentType.Police)}
                                    sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                                >
                                    <Box sx={{ 
                                        p: 3, 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%'
                                    }}>
                                        <LocalPoliceIcon 
                                            sx={{ 
                                                fontSize: 80, 
                                                color: '#4caf50',
                                                mb: 2
                                            }} 
                                        />
                                        <Typography variant="h5" component="div" align="center">
                                            Police
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                                            Report a police emergency
                                        </Typography>
                                    </Box>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
                
                <Box sx={{ mt: 4, width: '100%', maxWidth: '900px', px: 2 }}>
                    <Typography variant="body1" align="center">
                        {incident.type !== IncidentType.Unset 
                            ? `You've selected: ${incident.type === IncidentType.Fire 
                                ? 'Fire' 
                                : incident.type === IncidentType.Medical 
                                    ? 'Medical' 
                                    : 'Police'} emergency` 
                            : 'Please select an emergency type'}
                    </Typography>
                </Box>
            </div>
        </div>
    );
};

export default Reach911Step2; 