import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapLoading from './MapLoading';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../app/store';
import { updateIncident } from '../../features/incidentSlice';
import { RootState } from '../../utils/types';
import IIncident from '../../models/Incident';
import { Alert, Box, Typography } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface MapboxProps {
    showMarker?: boolean;
    disableGeolocation?: boolean; // New prop to disable geolocation
}

const Mapbox: React.FC<MapboxProps> = ({ showMarker = true, disableGeolocation = false }) => {
  // Refs for the map container, map instance, and marker
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // State to track map loading and errors
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const incident: IIncident = useSelector((state: RootState) => state.incidentState.incident);

  // State for current location
  const [currentLat, setCurrentLat] = useState<number>(40);
  const [currentLng, setCurrentLng] = useState<number>(-74.5);

  // -------------------------------- helper function start --------------------------------

  // Function to initialize the map using the given longitude and latitude.
  // This function is called once regardless of geolocation success or failure.
  const initializeMap = (lng: number, lat: number, initialZoom: number) => {
    if (!mapContainerRef.current) return;
    try {
      // Create a new map instance
      if (disableGeolocation) {
        initialZoom = 14;
      }
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/domoncassiu/cm7og9k1l005z01rdd6l78pdf', 
        center: [lng, lat],
        zoom: initialZoom,
      });
      // When the map loads, add a draggable marker and update the address
      mapRef.current.on('load', () => {
        // Add a draggable marker at the current location
        mapRef.current!.setProjection({ name: 'globe' });

        // If showMarker is true, add a draggable marker
        if (showMarker) {
            markerRef.current = new mapboxgl.Marker({
              draggable: true,
              color: '#FF0000',
            })
              .setLngLat([lng, lat])
              .addTo(mapRef.current!);
            markerRef.current.on('dragend', () => {
              const lngLat = markerRef.current!.getLngLat();
              updateAddressFromCoordinates(lngLat.lng, lngLat.lat);
            });
            // Update address initially
            updateAddressFromCoordinates(lng, lat);
        }
        setIsMapLoaded(true);

        // Trigger geolocation if the map was initialized with default coordinates
        if (initialZoom == 1 && !disableGeolocation) {
            geolocateControl!.trigger();
        }
      });
      // Handle map errors
      mapRef.current.on('error', (e: any) => {
        console.error('Mapbox error:', e);
        setMapError('Failed to load map');
      });
      // Add geolocate control to allow tracking the user’s location (only if not disabled)
      let geolocateControl: mapboxgl.GeolocateControl | null = null;
      if (!disableGeolocation) {
        geolocateControl = new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
        });
        mapRef.current.addControl(geolocateControl);
        // Update marker position when geolocation is triggered
        geolocateControl.on('geolocate', (e: any) => {
          const { longitude, latitude } = e.coords;
          if (markerRef.current && showMarker) {
            markerRef.current.setLngLat([longitude, latitude]);
            updateAddressFromCoordinates(longitude, latitude);
          }
        });
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map');
    }
  };

  // -------------------------------- helper function end --------------------------------

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZG9tb25jYXNzaXUiLCJhIjoiY2x1cW9qb3djMDBkNjJoa2NoMG1hbGsyNyJ9.nqTwoyg7Xf4v__5IwYzNDA';

    // If geolocation is available, get the user's current position
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLat(latitude);
          setCurrentLng(longitude);
          // Initialize the map with the user's coordinates
          initializeMap(longitude, latitude, 1);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setMapError('Could not access your location. Please enter your address manually.');
          // Use default coordinates if geolocation fails
          initializeMap(-74.5, 40, 14);
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
      setMapError('Geolocation is not supported by your browser. Please enter your address manually.');
      // Initialize with default coordinates if geolocation is not supported
      initializeMap(-74.5, 40, 14);
    }
    
    // Cleanup: remove the map instance on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [showMarker, disableGeolocation]);


// -------------------------------- reach 911 features start --------------------------------

    // Function to update the address using Mapbox's Geocoding API based on longitude and latitude
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
                address: address,
            }));
            }
        } catch (error) {
            console.error('Error fetching address:', error);
        }
    };

    // When incident.address changes (from external updates), update the marker position
    useEffect(() => {
        if (mapRef.current && markerRef.current && incident.address && incident.address !== '') {
        if (!(markerRef.current as any)._isDragging) {
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
                    zoom: 14,
                });
                }
            })
            .catch(error => {
                console.error('Error geocoding address:', error);
            });
        }
        }
    }, [incident.address]);

// -------------------------------- reach 911 features end --------------------------------




// -------------------------------- wildfire features start --------------------------------

// -------------------------------- wildfire features end --------------------------------

    
  // If there is a map error, display a fallback UI
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
