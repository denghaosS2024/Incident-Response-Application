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
}

const Mapbox: React.FC<MapboxProps> = ({ showMarker = true }) => {
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
  const [currentPathname, setCurrentPathname] = useState<string>(window.location.pathname);

  const geolocateControlRef = useRef<mapboxgl.GeolocateControl | null>(null);

  // Function to reset map to appropriate state for current page
  const resetMapForCurrentPage = () => {
    if (!mapRef.current) return;
    
    const pathname = window.location.pathname;
    const is911Page = pathname.includes('911');
    
    try {
      // Clear any existing marker
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      
      // Update projection based on page
      if (is911Page) {
        mapRef.current.setProjection({ name: 'mercator' });
        // For 911 page, create a new marker
        if (showMarker) {
          markerRef.current = new mapboxgl.Marker({
            draggable: true,
            color: '#FF0000',
          })
            .setLngLat([currentLng, currentLat])
            .addTo(mapRef.current);
          
          markerRef.current.on('dragend', () => {
            if (!markerRef.current) return;
            const lngLat = markerRef.current.getLngLat();
            updateAddressFromCoordinates(lngLat.lng, lngLat.lat);
          });
          
          // Update address with current marker position
          updateAddressFromCoordinates(currentLng, currentLat);
        }
      } else {
        mapRef.current.setProjection({ name: 'globe' });
      }
      
      // Handle geolocation control for each page type
      if (geolocateControlRef.current) {
        if (is911Page) {
          // For 911 page, completely disable geolocation
          disableGeolocation();
        } else {
          // For map page, enable geolocation after a delay to ensure map is ready
          setTimeout(() => {
            if (mapRef.current && geolocateControlRef.current) {
              try {
                geolocateControlRef.current.trigger();
              } catch (e) {
                console.log('Error triggering geolocation:', e);
              }
            }
          }, 800);
        }
      }
    } catch (error) {
      console.error('Error in resetMapForCurrentPage:', error);
    }
  };

  // Helper function to completely disable geolocation
  const disableGeolocation = () => {
    if (!mapRef.current || !geolocateControlRef.current) return;
    
    try {
      // First try to clear any active tracking
      if (typeof geolocateControlRef.current._clearWatch === 'function') {
        geolocateControlRef.current._clearWatch();
      }
      
      // Sometimes we need to remove the entire control and re-add it
      mapRef.current.removeControl(geolocateControlRef.current);
      
      // Create a new instance that's disabled
      const disabledGeolocate = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: false },
        trackUserLocation: false,
        showUserLocation: false,
      });
      
      // Store the new reference
      geolocateControlRef.current = disabledGeolocate;
      
      // Add the disabled control
      mapRef.current.addControl(disabledGeolocate);
      
      // Manually remove any remaining geolocation UI elements
      const mapContainer = mapRef.current.getContainer();
      const geolocateElements = mapContainer.querySelectorAll('.mapboxgl-user-location-dot, .mapboxgl-user-location');
      geolocateElements.forEach(el => {
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    } catch (e) {
      console.log('Error disabling geolocation:', e);
    }
  };

  // Helper function to geocode an address
  const geocodeAddress = (address: string) => {
    if (!mapRef.current || !address) return;
    
    try {
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}`
      )
      .then(response => response.json())
      .then(data => {
        if (!mapRef.current || !data.features || data.features.length === 0) return;
        
        const [lng, lat] = data.features[0].center;
        
        if (markerRef.current) {
          markerRef.current.setLngLat([lng, lat]);
        }
        
        // Set view without animation to avoid double zoom effect
        mapRef.current.setCenter([lng, lat]);
        mapRef.current.setZoom(14);
      })
      .catch(error => {
        console.error('Error geocoding address:', error);
      });
    } catch (error) {
      console.error('Error in geocodeAddress:', error);
    }
  };

  // Listen for page changes
  useEffect(() => {
    const handleRouteChange = () => {
      if (currentPathname !== window.location.pathname) {
        setCurrentPathname(window.location.pathname);
        resetMapForCurrentPage();
      }
    };

    // Set up listener for path changes
    window.addEventListener('popstate', handleRouteChange);
    
    // Check on initial mount
    resetMapForCurrentPage();
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [currentPathname, showMarker]);

  // Function to initialize the map using the given longitude and latitude.
  // This function is called once regardless of geolocation success or failure.
  const initializeMap = (lng: number, lat: number, initialZoom: number) => {
    if (!mapContainerRef.current) return;
    try {
      // Create a new map instance
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/domoncassiu/cm7og9k1l005z01rdd6l78pdf', 
        center: [lng, lat],
        zoom: initialZoom,
      });
      
      // When the map loads, add a draggable marker and update the address
      mapRef.current.on('load', () => {
        if (!mapRef.current) return;
        
        // Determine if this is the 911 page
        const is911Page = window.location.pathname.includes('911');
        
        // Set appropriate projection
        if (is911Page && showMarker) {
          mapRef.current.setProjection({ name: 'mercator' });
        } else if (!is911Page) {
          mapRef.current.setProjection({ name: 'globe' });
        }

        // If showMarker is true, add a draggable marker
        if (showMarker) {
          if (markerRef.current) {
            markerRef.current.remove();
          }
          
          markerRef.current = new mapboxgl.Marker({
            draggable: true,
            color: '#FF0000',
          })
            .setLngLat([lng, lat])
            .addTo(mapRef.current);
            
          markerRef.current.on('dragend', () => {
            if (!markerRef.current) return;
            const lngLat = markerRef.current.getLngLat();
            updateAddressFromCoordinates(lngLat.lng, lngLat.lat);
          });
          
          // Update address initially
          updateAddressFromCoordinates(lng, lat);
        }
        
        setIsMapLoaded(true);

        // Add specific functionality for each page type
        if (is911Page && showMarker) {
          // For 911 page, avoid geolocation
          if (incident.address && incident.address !== '') {
            // If we have an address, center on it without animation
            geocodeAddress(incident.address);
          }
        } else if (!is911Page) {
          // For map page, trigger geolocation after a delay
          setTimeout(() => {
            if (mapRef.current && geolocateControlRef.current) {
              try {
                geolocateControlRef.current.trigger();
              } catch (e) {
                console.log('Error triggering geolocation:', e);
              }
            }
          }, 800);
        }
      });
      
      // Handle map errors
      mapRef.current.on('error', (e: any) => {
        console.error('Mapbox error:', e);
        setMapError('Failed to load map');
      });
      
      // Add geolocation control with appropriate settings
      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: !showMarker, // Only track continuously on map page
        showUserLocation: !showMarker, // Only show location on map page
      });
      
      // Store reference and add to map
      geolocateControlRef.current = geolocateControl;
      mapRef.current.addControl(geolocateControl);
      
      // Update marker position when geolocation is triggered
      geolocateControl.on('geolocate', (e: any) => {
        if (!mapRef.current) return;
        
        const { longitude, latitude } = e.coords;
        
        if (showMarker && markerRef.current) {
          markerRef.current.setLngLat([longitude, latitude]);
          updateAddressFromCoordinates(longitude, latitude);
        } else if (!showMarker) {
          // For /map page, ensure the map zooms in properly
          try {
            mapRef.current.flyTo({
              center: [longitude, latitude],
              zoom: 10,
              duration: 2000
            });
          } catch (error) {
            console.error('Error in flyTo:', error);
          }
        }
      });
      
      // If this is the 911 page, immediately disable geolocation
      if (showMarker && window.location.pathname.includes('911')) {
        setTimeout(disableGeolocation, 100);
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map');
    }
  };

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
      try {
        // First disable geolocation if this is the 911 page
        if (showMarker && window.location.pathname.includes('911')) {
          disableGeolocation();
        }
        
        // Clear any markers
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }
        
        // Reset geolocate control and map
        if (mapRef.current) {
          // Remove the map
          mapRef.current.remove();
          mapRef.current = null;
          geolocateControlRef.current = null;
        }
      } catch (error) {
        console.error('Error in cleanup:', error);
      }
    };
  }, [showMarker]);


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
        if (!mapRef.current || !incident.address || incident.address === '') return;
        
        try {
          // Only update if this is the 911 page
          if (showMarker && window.location.pathname.includes('911')) {
            // Don't update if the marker is currently being dragged
            if (markerRef.current && !(markerRef.current as any)._isDragging) {
              geocodeAddress(incident.address);
            }
          }
        } catch (error) {
          console.error('Error in address change effect:', error);
        }
    }, [incident.address, isMapLoaded, showMarker]);

// -------------------------------- reach 911 features end --------------------------------

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
