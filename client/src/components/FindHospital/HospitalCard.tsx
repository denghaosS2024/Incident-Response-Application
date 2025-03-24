import IHospital from '@/models/Hospital'
import { Box, Typography } from '@mui/material'
import React from 'react'

interface HospitalProps {
  hospital: IHospital
}

const HospitalCard: React.FC<HospitalProps> = ({ hospital }) => {
  return (
    <Box className="border border-gray-300 rounded-lg p-3 mb-2">
      <Typography className="font-extrabold" fontWeight="bold">
        {hospital.hospitalName}
      </Typography>
      <Typography variant="body2" className="text-sm">
        {hospital.hospitalAddress}
      </Typography>
      <Typography variant="body2" className="text-sm text-gray-500">
        Total ER Beds: {hospital.totalNumberERBeds || 0}
      </Typography>
    </Box>
  )
}

export default HospitalCard
