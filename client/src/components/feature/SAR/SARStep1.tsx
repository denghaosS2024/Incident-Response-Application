import { Box, TextField, Typography, Button, Chip } from '@mui/material'
import styles from '../../../styles/Reach911Page.module.css'
import Map from '../../Map/Mapbox'

import { AddressAutofillRetrieveResponse } from '@mapbox/search-js-core'
import { AddressAutofill } from '@mapbox/search-js-react'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import AddIcon from '@mui/icons-material/Add'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import IIncident from '../../../models/Incident'
import { updateIncident } from '../../../redux/incidentSlice'
import { AppDispatch, RootState } from '../../../redux/store'
import Globals from '../../../utils/Globals'

interface SARStep1Props {
  autoPopulateData?: boolean
  isCreatedByFirstResponder?: boolean
  incidentId?: string
}

const SARStep1: React.FC<SARStep1Props> = ({
  autoPopulateData,
  // isCreatedByFirstResponder and incidentId are kept for API compatibility
  // but we're now using the incident from Redux store
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const incident: IIncident = useSelector(
    (state: RootState) => state.incidentState.incident,
  )

  // Local state for the input field
  const [inputAddress, setInputAddress] = useState(incident.address || '')

  // Sample SAR task locations - in a real app, these would come from an API
  const [sarLocations] = useState([
    {
      id: 'task1',
      name: 'Search Area A',
      status: 'todo',
      location: { latitude: 37.7749, longitude: -122.4194 },
    },
    {
      id: 'task2',
      name: 'Search Area B',
      status: 'in-progress',
      location: { latitude: 37.7850, longitude: -122.4100 },
    },
    {
      id: 'task3',
      name: 'Search Area C',
      status: 'done',
      location: { latitude: 37.7700, longitude: -122.4300 },
    },
  ])

  // Initialize address field from location when component loads
  useEffect(() => {
    const hasLocation =
      incident.location?.latitude && incident.location?.longitude;
    const hasAddress = incident.address && incident.address.trim() !== '';

    // If we have a location but no address, get the address from the location
    if (hasLocation && !hasAddress && incident.location) {
      const { latitude, longitude } = incident.location;

      // Access token
      const accessToken = Globals.getMapboxToken();

      // Reverse geocode to get address
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken}`,
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.features && data.features.length > 0) {
            const address = data.features[0].place_name;
            dispatch(
              updateIncident({
                ...incident,
                address: address,
              }),
            );
            setInputAddress(address);
          }
        })
        .catch((error) => {
          console.error('Error geocoding location:', error);
        });
    }
  }, [incident.location, incident.address, dispatch]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { value } = e.target;
    setInputAddress(value);
  };

  // If a user clicks on a suggestion from the autofill dropdown, we update the incident with the new location
  function onRetrieve(res: AddressAutofillRetrieveResponse) {
    const newAddress = res.features[0].properties.full_address ?? '';
    const newLocation = {
      longitude: res.features[0].geometry.coordinates[0],
      latitude: res.features[0].geometry.coordinates[1],
    };
    dispatch(
      updateIncident({
        ...incident,
        location: newLocation,
        address: newAddress,
      }),
    );
  }

  // When user clicks out of the input, we revert it back to the original incident location
  function onBlur() {
    setInputAddress(incident.address);
  }

  // We listen to incident's location changes, and update the text field accordingly. We do this to support manual changes from the map's pin.
  useEffect(() => {
    setInputAddress(incident.address);
  }, [incident.address]);

  // No longer creating incidents here - this is now handled by the Incidents page

  return (
    <div className={styles.wrapperStep1}>
      <div className={styles.flexCenterColumn}>
        <Typography variant="h5" align="center" gutterBottom>
          Search and Rescue (SAR) Incident
        </Typography>
        
        {incident.incidentId && (
          <Typography 
            variant="h6" 
            align="center" 
            sx={{ 
              mb: 2, 
              fontWeight: 'bold',
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
              py: 1,
              px: 2,
              borderRadius: 1,
              display: 'inline-block'
            }}
          >
            Incident ID: {incident.incidentId}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
          <Chip label="Todo" color="default" variant="outlined" />
          <Chip label="In Progress" color="primary" variant="outlined" />
          <Chip label="Done" color="success" variant="outlined" />
        </Box>

        <Typography
          variant="subtitle1"
          className={styles.bold}
          align="center"
          gutterBottom
        >
          SAR Operations Map - Current Tasks and Last Known Location:
        </Typography>
        
        {/* Create Task Button - Only visible to the creator of the incident */}
        {incident.caller === localStorage.getItem('username') && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/sar/${incident._id}/tasks/new`)}
            >
              Create New Task
            </Button>
          </Box>
        )}
        
        <div className={styles.flexCenter}>
          <Box
            sx={{
              width: { xs: '90%', sm: '90%', md: '90%', lg: '90%' },
              maxWidth: '900px',
            }}
          >
            <form>
              <AddressAutofill
                onRetrieve={onRetrieve}
                options={{ streets: false }}
                accessToken={Globals.getMapboxToken()}
              >
                <TextField
                  fullWidth
                  id="outlined-basic"
                  label="Last Known Location or Search Area"
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
      <div className={styles.flexCenter}>
        <Box
          sx={{
            width: '100%',
            maxWidth: '800px',
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
              Map shows SAR tasks and last known locations
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
                disableGeolocation={false}
                // In a real implementation, we would pass the SAR locations to the Map component
                // and extend the Map component to display different markers for different task statuses
                // sarLocations={sarLocations}
              />
            </div>
          </div>
        </Box>
      </div>

      {/* Display SAR locations/tasks list */}
      <Box sx={{ width: '90%', maxWidth: '900px', mx: 'auto', mt: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          SAR Tasks
        </Typography>
        {sarLocations.map((task) => (
          <Box
            key={task.id}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              mb: 1,
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              backgroundColor:
                task.status === 'done'
                  ? 'rgba(76, 175, 80, 0.1)'
                  : task.status === 'in-progress'
                  ? 'rgba(33, 150, 243, 0.1)'
                  : 'white',
            }}
          >
            <Typography variant="body1">{task.name}</Typography>
            <Chip
              label={
                task.status === 'todo'
                  ? 'To Do'
                  : task.status === 'in-progress'
                  ? 'In Progress'
                  : 'Done'
              }
              color={
                task.status === 'done'
                  ? 'success'
                  : task.status === 'in-progress'
                  ? 'primary'
                  : 'default'
              }
              size="small"
            />
          </Box>
        ))}
      </Box>
    </div>
  );
};

export default SARStep1;
