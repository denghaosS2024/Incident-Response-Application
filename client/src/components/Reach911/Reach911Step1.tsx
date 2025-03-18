import { Box, TextField, Typography } from '@mui/material'
import styles from '../../styles/Reach911Page.module.css'
import Map from '../Map/Mapbox'

import { AddressAutofillRetrieveResponse } from '@mapbox/search-js-core'
import { AddressAutofill } from '@mapbox/search-js-react'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import IIncident from '../../models/Incident'
import { updateIncident } from '../../redux/incidentSlice'
import { AppDispatch, RootState } from '../../redux/store'


interface Reach911Step1Props {
  autoPopulateData?: boolean
  isCreatedByFirstResponder?: boolean
  incidentId?: string
}

const Reach911Step1: React.FC<Reach911Step1Props> = ({
  autoPopulateData,
  isCreatedByFirstResponder,
  incidentId,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const incident: IIncident = useSelector(
    (state: RootState) => state.incidentState.incident,
  )

  // Local state for the input field
  const [inputAddress, setInputAddress] = useState(incident.address || '')

  // Initialize address field from location when component loads
  useEffect(() => {
    const hasLocation =
      incident.location?.latitude && incident.location?.longitude
    const hasAddress = incident.address && incident.address.trim() !== ''

    // If we have a location but no address, get the address from the location
    if (hasLocation && !hasAddress && incident.location) {
      const { latitude, longitude } = incident.location

      // Access token
      const accessToken =
        'pk.eyJ1IjoiZG9tb25jYXNzaXUiLCJhIjoiY204Mnlqc3ZzMWxuNjJrcTNtMTFjOTUyZiJ9.isQSr9JMLSztiJol_nQSDA'

      // Reverse geocode to get address
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken}`,
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.features && data.features.length > 0) {
            const address = data.features[0].place_name
            dispatch(
              updateIncident({
                ...incident,
                address: address,
              }),
            )
            setInputAddress(address)
          }
        })
        .catch((error) => {
          console.error('Error geocoding location:', error)
        })
    }
  }, [incident.location, incident.address, dispatch])

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { value } = e.target
    setInputAddress(value)
  }

  // If a user clicks on a suggestion from the autofil dropdown, we update the incident with the new location! 
  function onRetrieve(res: AddressAutofillRetrieveResponse) {
    const newAddress = res.features[0].properties.full_address ?? '';
    const newLocation = {longitude: res.features[0].geometry.coordinates[0], latitude: res.features[0].geometry.coordinates[1]};
    dispatch(
      updateIncident({
        ...incident,
        location: newLocation,
        address: newAddress,
      }),
    )
  }

  // When user clicks out of the input, we revert it back to the original incident location!
  function onBlur(){
    setInputAddress(incident.address);
  }

  // We listen to incident's location changes, and update the text field accordingly. We do this to support manual changes from the map's pin. 
  useEffect(()=>{
    setInputAddress(incident.address);
  }, [incident.address])  


  return (
    <div className={styles.wrapperStep1}>
      <div className={styles.flexCenterColumn}>
        <Typography variant="h6" align="center" gutterBottom>
          {isCreatedByFirstResponder
            ? `Incident ID: ${incidentId}`
            : 'You have reached 911.'}
        </Typography>
        <Typography
          variant="subtitle1"
          className={styles.bold}
          align="center"
          gutterBottom
        >
          Enter emergency address:
        </Typography>
        <div className={styles.flexCenter}>
          <Box
            sx={{
              width: { xs: '90%', sm: '90%', md: '90%', lg: '90%' },
              maxWidth: '900px',
            }}
          >
            <form>
              <AddressAutofill onRetrieve={onRetrieve} options={{streets:false}} accessToken="pk.eyJ1IjoiZG9tb25jYXNzaXUiLCJhIjoiY204Mnlqc3ZzMWxuNjJrcTNtMTFjOTUyZiJ9.isQSr9JMLSztiJol_nQSDA">
                <TextField
                  fullWidth
                  id="outlined-basic"
                  label="Address"
                  variant="outlined"
                  value={inputAddress}
                  autoComplete="street-address"
                  onBlur={onBlur}
                  onChange={(e) => onChange(e)}
                />
              </AddressAutofill>
            </form>
          </Box>
        </div>
      </div>
      <Box
        sx={{
          width: { xs: '90%', sm: '90%', md: '90%', lg: '90%' },
          maxWidth: '900px',
          height: { xs: '400px', sm: '500px', md: '500px' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          mt: 2,
          mx: 'auto',
          mb: 2,
          position: 'relative',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <LocationOnIcon color="error" />
          <Typography variant="body2" align="center">
            Drag the red marker to refine your location
          </Typography>
        </Box>
        <div
          className={styles.flexCenter}
          style={{
            height: '100%',
            width: '100%',
            position: 'relative',
            minHeight: '400px', // Ensure minimum height for the map
          }}
        >
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
            <Map
              autoPopulateData={autoPopulateData}
              showMarker={true}
              disableGeolocation={false} // Allow geolocation if no address is set yet
            />
          </div>
        </div>
      </Box>
    </div>
  )
}

export default Reach911Step1
