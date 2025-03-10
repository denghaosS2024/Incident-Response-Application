import { ChangeEvent, FC, useState } from 'react'
import request from '../../utils/request'

interface VehicleCheckboxProps {
  personnelName: string
  vehicleName: string
}

const VehicleCheckbox: FC<VehicleCheckboxProps> = ({
  personnelName,
  vehicleName,
}) => {
  const [checked, setChecked] = useState(false)

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()

    try {
      if (!checked) {
        // If box is NOT checked and user clicks, call /api/personnel/vehicles
        await request('/api/personnel/vehicles', {
          method: 'PUT',
          body: JSON.stringify({ personnelName, vehicleName }),
        })
      } else {
        // If box IS checked and user clicks, call /api/personnel/vehicles/release
        await request('/api/personnel/vehicles/release', {
          method: 'PUT',
          body: JSON.stringify({ personnelName, vehicleName }),
        })
      }
      // Toggle the local checked state
      setChecked(!checked)
    } catch (error) {
      console.error('Error updating vehicle assignment:', error)
    }
  }

  return (
    <label>
      <input type="checkbox" checked={checked} onChange={handleChange} />
      {vehicleName}
    </label>
  )
}

export default VehicleCheckbox
