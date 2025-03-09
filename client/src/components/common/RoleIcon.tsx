import * as React from "react";
import {
    ReportProblem as ReportProblemIcon,
    LocalTaxi as LocalTaxiIcon,
    LocalFireDepartment as FireIcon,
    HealthAndSafety as NurseIcon,
} from "@mui/icons-material";


export const getRoleIcon = (role: string): JSX.Element | null => {
    switch (role) {
        case 'Dispatch':
            return <ReportProblemIcon sx={{ color: 'red', marginRight: '8px' }} />;
        case 'Police':
            return <LocalTaxiIcon sx={{ color: 'red', marginRight: '8px' }} />;
        case 'Fire':
            return <FireIcon sx={{ color: 'red', marginRight: '8px' }} />;
        case 'Nurse':
            return <NurseIcon sx={{ color: 'red', marginRight: '8px' }} />;
        default:
            return null;
    }
};

export default getRoleIcon;
