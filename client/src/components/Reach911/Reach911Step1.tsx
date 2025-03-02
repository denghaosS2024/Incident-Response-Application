import {
    Box,
    TextField,
} from '@mui/material'
import styles from '../../styles/Reach911Page.module.css'
import MapLayer from '../Map/MapLayer';

import React from 'react'
import IIncident from '../../models/Incident';
import { RootState } from '../../utils/types';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../app/store';
import { updateIncident } from '../../features/incidentSlice';

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
                You have reached 911.
                <p className={styles.bold}>
                    Enter emergency address:
                </p>
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
                height: { xs: "400px", sm: "600px", md: "600px" },
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                mt: 2,
                mx: "auto",
            }}
            >
                <div className={styles.flexCenter}>
                    <MapLayer />
                    <div>
                        Refine position by pressing the incident icon
                    </div>
                </div>
            </Box>

        </div>
    );
};

export default Reach911Step1;