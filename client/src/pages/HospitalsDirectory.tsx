import {
  Box,
  Typography
} from '@mui/material';
import GenericListContainer from '../components/GenericListContainer';

type HospitalData = {
    id: string,
    name: string;
    totalBeds: number;
    availableBeds: number;
};
const HospitalsDirectory: React.FC = () => {

  // Example data for hospitals for feature toggling demo purposes
    const hospitalList: HospitalData[] = [
        { id: "1", name: "El Camino", totalBeds: 100, availableBeds: 10 },
        { id: "2", name: "General Hospital", totalBeds: 200, availableBeds: 20 }
    ];

return (
    <Box sx={{ padding: 2 }}>
  
      <GenericListContainer<HospitalData>
        key="hospitals"
        header="Hospitals"
        listProps={{
          items: hospitalList,
          loading: false,
          getKey: (hospital: HospitalData): string => hospital.id,
          renderItem: (hospital) => (
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 2, 
                alignItems: 'center',
                padding: 1,
              }}>
                <Typography variant="body2" sx={{ textAlign: 'left' }}>
                  {hospital.name}
                </Typography>
                <Typography variant="body2" sx={{ textAlign: 'center' }}>
                  {hospital.totalBeds}
                </Typography>
                <Typography variant="body2" sx={{ textAlign: 'center' }}>
                  {hospital.availableBeds}
                </Typography>              
            </Box>
          ),
        }}
      />
    </Box>
  );
}

export default HospitalsDirectory
