import IHospital from "@/models/Hospital";
import IPatient from "@/models/Patient";
import { RootState } from "@/redux/store";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import HospitalCard from "./HospitalCard";

interface HospitalListProps {
  hospitals: IHospital[];
  draggedPatients: Record<string, IPatient[]>;
}
const HospitalList: React.FC<HospitalListProps> = ({
  hospitals,
  draggedPatients,
}) => {
  const loading: boolean = useSelector(
    (state: RootState) => state.hospital.loading,
  );

  const error: string | null = useSelector(
    (state: RootState) => state.hospital.error,
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box className="w-3/5">
      {hospitals.length > 0 ? (
        hospitals.map((hospital, index) => (
          <HospitalCard
            key={hospital.hospitalId}
            id={hospital.hospitalId}
            hospital={hospital}
            patients={draggedPatients[hospital.hospitalId] || []}
            index={index}
          />
        ))
      ) : (
        <Typography variant="body1" className="p-3">
          No hospitals found. Please register hospitals first.
        </Typography>
      )}
    </Box>
  );
};

export default HospitalList;
