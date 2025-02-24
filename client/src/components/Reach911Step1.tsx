import {
    Box,
    TextField,
} from '@mui/material'
import styles from '../styles/Reach911Page.module.css'


const Reach911Step1 = () => {

    return (
        <div className={styles.wrapperStep1}>
            <div className={styles.flexCenter}>
                You have reached 911.
                <p className={styles.bold}>
                    Enter emergency address:
                </p>
                <div>
                    <Box width="100%" maxWidth="500px">
                        <TextField id="outlined-basic" label="Address" variant="outlined" />
                    </Box>
                </div>
            </div>
            <p className={styles.flexCenter}>
                <p>PLACEHOLDER FOR MAP</p>
                Refine position by pressing the incident icon
            </p>
        </div>
    );
};

export default Reach911Step1;