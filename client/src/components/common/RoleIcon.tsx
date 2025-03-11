import {
    LocalFireDepartment as FireIcon,
    LocalHospital as NurseIcon,
    LocalPolice as PoliceIcon,
} from "@mui/icons-material";


export const getRoleIcon = (role: string): JSX.Element | null => {
    switch (role) {
        case 'Dispatch':
            return <img
                        src="/911-icon-red.png"
                        alt="Red 911 Icon"
                        style={{ width: '28px', height: '28px', borderRadius: '8px' }}
                    />;
        case 'Police':
            return <PoliceIcon sx={{ color: 'red', marginRight: '8px' }} />;
        case 'Fire':
            return <FireIcon sx={{ color: 'red', marginRight: '8px' }} />;
        case 'Nurse':
            return <NurseIcon sx={{ color: 'red', marginRight: '8px' }} />;
        default:
            return null;
    }
};

export default getRoleIcon;
