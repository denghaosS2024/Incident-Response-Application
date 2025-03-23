import IHospital from '@/models/Hospital';
import request from '@/utils/request';
import { Add } from '@mui/icons-material';
import {
  Box,
  IconButton,
  Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import GenericListContainer from '../components/GenericListContainer';

const HospitalsDirectory: React.FC = () => {

  const [hospitalList, setHospitalList] = useState<IHospital[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch hospitals from the server
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setError(null)
      try {
        const data = await request('/api/hospital')
        setHospitalList(data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch hospitals'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])


  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

return (
    <Box sx={{ padding: 2 }}>
  
      <GenericListContainer<IHospital>
        key="hospitals"
        header="Hospitals"
        listProps={{
          items: hospitalList,
          loading: false,
          getKey: (hospital: IHospital): string => hospital.hospitalId,
          renderItem: (hospital: IHospital) => (
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 2, 
                alignItems: 'center',
                padding: 1,
              }}>
                <Typography variant="body2" sx={{ textAlign: 'left' }}>
                  {hospital.hospitalName}
                </Typography>
                <Typography variant="body2" sx={{ textAlign: 'center' }}>
                  {hospital.totalNumberERBeds}
                </Typography>
                <Typography variant="body2" sx={{ textAlign: 'center' }}>
                  {0}
                </Typography>              
            </Box>
          ),
        }}
      />
   <IconButton
              sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                width: 56,
                height: 56,
              }}
            >
              <Add fontSize="large" />
            </IconButton>
    </Box>
    
  );
}

export default HospitalsDirectory
