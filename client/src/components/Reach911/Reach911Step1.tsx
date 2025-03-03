import {
    Box,
    TextField,
    Typography,
    Paper,
} from '@mui/material'
import styles from '../../styles/Reach911Page.module.css'
import MapLayer from '../Map/MapLayerNew';

import React from 'react'
import IIncident from '../../models/Incident';
import { RootState } from '../../utils/types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../app/store';
import { updateIncident } from '../../features/incidentSlice';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const Reach911Step1 = () => {
    const dispatch = useDispatch<AppDispatch>();
    const incident: IIncident = useSelector((state: RootState) => state.incidentState.incident)
    const address = incident.address

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { value } = e.target;

        dispatch(updateIncident({
            ...incident,
            address: value
        }));
    };

    return (
        <div className={styles.wrapperStep1}>
            <div className={styles.flexCenterColumn}>
                <Typography variant="h6" align="center" gutterBottom>
                    You have reached 911.
                </Typography>
                <Typography variant="subtitle1" className={styles.bold} align="center" gutterBottom>
                    Enter emergency address:
                </Typography>
                <div className={styles.flexCenter}>
                    <Box sx={{
                        width: { xs: "90%", sm: "90%", md: "90%", lg: "90%" },
                        maxWidth: "900px"
                    }}>
                        <TextField
                            fullWidth
                            id="outlined-basic"
                            label="Address"
                            variant="outlined"
                            value={address}
                            onChange={(e) => onChange(e)}
                        />
                    </Box>
                </div>
            </div>
            <Box sx={{
                width: { xs: "90%", sm: "90%", md: "90%", lg: "90%" },
                maxWidth: "900px",
                height: { xs: "400px", sm: "500px", md: "500px" },
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                mt: 2,
                mx: "auto",
                mb: 2,
                position: "relative",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
            }}
            >
                <div className={styles.flexCenter} style={{ 
                    height: '100%', 
                    width: '100%', 
                    position: 'relative',
                    minHeight: '400px' // Ensure minimum height for the map
                }}>
                    <MapLayer />
                </div>
            </Box>
        </div>
    );
};

export default Reach911Step1;