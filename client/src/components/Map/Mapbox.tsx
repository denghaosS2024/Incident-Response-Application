import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapLoading from './MapLoading'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../app/store';
import { updateIncident } from '../../features/incidentSlice';
import { RootState } from '../../utils/types';
import IIncident from '../../models/Incident';
import { Alert, Box, Typography } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const Mapbox: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const incident: IIncident = useSelector((state: RootState) => state.incidentState.incident);

  const [currentLat, setCurrentLat] = useState<number>(40);
  const [currentLng, setCurrentLng] = useState<number>(-74.5);

  // Function to update address based on coordinates
  const updateAddressFromCoordinates = async (lng: number, lat: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name;
        dispatch(updateIncident({
          ...incident,
          address: address
        }));
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZG9tb25jYXNzaXUiLCJhIjoiY2x1cW9qb3djMDBkNjJoa2NoMG1hbGsyNyJ9.nqTwoyg7Xf4v__5IwYzNDA';

    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLat(latitude);
            setCurrentLng(longitude);
            
            // Initialize map and set the center to the user's current location
            if (mapContainerRef.current) {
              try {
                mapRef.current = new mapboxgl.Map({
                  container: mapContainerRef.current,
                  style: 'mapbox://styles/mapbox/streets-v11', // Use a standard style that's more likely to work
                  center: [longitude, latitude],
                  zoom: 14,
                });

                mapRef.current.on('load', () => {
                  try {
                    // Add a draggable marker at the user's location
                    markerRef.current = new mapboxgl.Marker({
                      draggable: true,
                      color: '#FF0000'
                    })
                      .setLngLat([longitude, latitude])
                      .addTo(mapRef.current!);

                    // Update address when marker is dragged
                    markerRef.current.on('dragend', () => {
                      const lngLat = markerRef.current!.getLngLat();
                      updateAddressFromCoordinates(lngLat.lng, lngLat.lat);
                    });

                    // Initial address update based on current location
                    updateAddressFromCoordinates(longitude, latitude);
                    
                    setIsMapLoaded(true);
                  } catch (error) {
                    console.error('Error setting up marker:', error);
                    setMapError('Failed to set up location marker');
                  }
                });

                mapRef.current.on('error', (e) => {
                  console.error('Mapbox error:', e);
                  setMapError('Failed to load map');
                });

                const geolocateControl = new mapboxgl.GeolocateControl({
                  positionOptions: { enableHighAccuracy: true },
                  trackUserLocation: true,
                });
                
                mapRef.current.addControl(geolocateControl);
                
                // Update marker position when geolocate is triggered
                geolocateControl.on('geolocate', (e: any) => {
                  const { longitude, latitude } = e.coords;
                  if (markerRef.current) {
                    markerRef.current.setLngLat([longitude, latitude]);
                    updateAddressFromCoordinates(longitude, latitude);
                  }
                });
              } catch (error) {
                console.error('Error initializing map:', error);
                setMapError('Failed to initialize map');
              }
            }
          },
          (error) => {
            console.error('Geolocation error:', error);
            setMapError('Could not access your location. Please enter your address manually.');
            // Fallback if geolocation fails
            if (mapContainerRef.current) {
              try {
                mapRef.current = new mapboxgl.Map({
                  container: mapContainerRef.current,
                  style: 'mapbox://styles/mapbox/streets-v11',
                  center: [-74.5, 40],
                  zoom: 12,
                });
                
                mapRef.current.on('load', () => {
                  // Add a draggable marker
                  markerRef.current = new mapboxgl.Marker({
                    draggable: true,
                    color: '#FF0000'
                  })
                    .setLngLat([-74.5, 40])
                    .addTo(mapRef.current!);

                  // Update address when marker is dragged
                  markerRef.current.on('dragend', () => {
                    const lngLat = markerRef.current!.getLngLat();
                    updateAddressFromCoordinates(lngLat.lng, lngLat.lat);
                  });
                  
                  // Initial address update
                  updateAddressFromCoordinates(-74.5, 40);
                  
                  setIsMapLoaded(true);
                });

                mapRef.current.on('error', (e) => {
                  console.error('Mapbox error:', e);
                  setMapError('Failed to load map');
                });
              } catch (error) {
                console.error('Error initializing map:', error);
                setMapError('Failed to initialize map');
              }
            }
          }
        );
      } else {
        console.log('Geolocation is not supported by this browser.');
        setMapError('Geolocation is not supported by your browser. Please enter your address manually.');
        // Fallback if geolocation is not supported
        if (mapContainerRef.current) {
          try {
            mapRef.current = new mapboxgl.Map({
              container: mapContainerRef.current,
              style: 'mapbox://styles/mapbox/streets-v11',
              center: [-74.5, 40],
              zoom: 12,
            });
            
            mapRef.current.on('load', () => {
              // Add a draggable marker
              markerRef.current = new mapboxgl.Marker({
                draggable: true,
                color: '#FF0000'
              })
                .setLngLat([-74.5, 40])
                .addTo(mapRef.current!);

              // Update address when marker is dragged
              markerRef.current.on('dragend', () => {
                const lngLat = markerRef.current!.getLngLat();
                updateAddressFromCoordinates(lngLat.lng, lngLat.lat);
              });
              
              // Initial address update
              updateAddressFromCoordinates(-74.5, 40);
              
              setIsMapLoaded(true);
            });

            mapRef.current.on('error', (e) => {
              console.error('Mapbox error:', e);
              setMapError('Failed to load map');
            });
          } catch (error) {
            console.error('Error initializing map:', error);
            setMapError('Failed to initialize map');
          }
        }
      }
    } catch (error) {
      console.error('Error in map initialization:', error);
      setMapError('Failed to initialize map');
    }
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  // Update marker position if address changes from outside
  useEffect(() => {
    if (mapRef.current && markerRef.current && incident.address && incident.address !== '') {
      // Check if marker is currently being dragged
      // The property is _isDragging (a property), not isDragging()
      if (markerRef.current && !(markerRef.current as any)._isDragging) {
        // Geocode the address to get coordinates
        fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(incident.address)}.json?access_token=${mapboxgl.accessToken}`
        )
          .then(response => response.json())
          .then(data => {
            if (data.features && data.features.length > 0) {
              const [lng, lat] = data.features[0].center;
              markerRef.current!.setLngLat([lng, lat]);
              mapRef.current!.flyTo({
                center: [lng, lat],
                zoom: 14
              });
            }
          })
          .catch(error => {
            console.error('Error geocoding address:', error);
          });
      }
    }
  }, [incident.address]);

  // Fallback UI when map fails to load
  if (mapError) {
    return (
      <Box 
        sx={{ 
          width: '100%', 
          height: '100%',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: 2,
          backgroundColor: '#f5f5f5',
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        <Alert severity="warning" sx={{ mb: 2, width: '100%', boxSizing: 'border-box' }}>
          {mapError}
        </Alert>
        <LocationOnIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="body1" align="center">
          Please enter your address in the field above.
        </Typography>
      </Box>
    );
  }

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      <div 
        ref={mapContainerRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          minHeight: '400px',
          borderRadius: '8px',
          overflow: 'hidden',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }} 
      />
      {!isMapLoaded && <MapLoading />}
    </div>
  );
};

export default Mapbox;
