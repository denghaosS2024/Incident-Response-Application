import {
    Box,
    TextField,
    Typography,
    Paper,
} from '@mui/material'
import styles from '../../styles/Reach911Page.module.css'
import MapLayer from '../Map/MapLayer';
import Map from '../Map/Mapbox';

import React from 'react'
import IIncident from '../../models/Incident';
import { RootState } from '../../utils/types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../app/store';
import { updateIncident } from '../../features/incidentSlice';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { AddressAutofill } from '@mapbox/search-js-react';

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
                        <form>
                            <AddressAutofill accessToken="pk.eyJ1IjoiZG9tb25jYXNzaXUiLCJhIjoiY2x1cW9qb3djMDBkNjJoa2NoMG1hbGsyNyJ9.nqTwoyg7Xf4v__5IwYzNDA">
                                <TextField
                                    fullWidth
                                    id="outlined-basic"
                                    label="Address"
                                    variant="outlined"
                                    value={address}
                                    autoComplete="street-address"
                                    onChange={(e) => onChange(e)}
                                />
                            </AddressAutofill>
                        </form>
                    </Box>
                </div>
            </div>
            <Box sx={{
                width: { xs: "90%", sm: "90%", md: "90%", lg: "90%" },
                maxWidth: "900px",
                height: { xs: "400px", sm: "500px", md: "500px" },
                display: "flex",
                flexDirection: "column",
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
                <Box sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    p: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1
                }}>
                    <LocationOnIcon color="error" />
                    <Typography variant="body2" align="center">
                        Drag the red marker to refine your location
                    </Typography>
                </Box>
                <div className={styles.flexCenter} style={{
                    height: '100%',
                    width: '100%',
                    position: 'relative',
                    minHeight: '400px' // Ensure minimum height for the map
                }}>
                    <div
                    style={{
                        height: '100%',
                        width: '100%',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        position: 'relative',
                        margin: 0,
                        padding: 0,
                    }}
                    >
                        <Map showMarker={true} disableGeolocation={true}/>
                    </div>
                </div>
            </Box>
        </div >
    );
};

export default Reach911Step1;