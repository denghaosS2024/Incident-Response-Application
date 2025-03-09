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
import MapDrop from './MapDrop';
import ReactDOMServer from 'react-dom/server'; 
import PushPinIcon from '@mui/icons-material/PushPin';
import CloudIcon from '@mui/icons-material/Cloud';
import FireHydrantAltIcon from '@mui/icons-material/FireHydrantAlt';
import BlockIcon from '@mui/icons-material/Block';

interface MapboxProps {
    showMarker?: boolean;
    disableGeolocation?: boolean; // New prop to disable geolocation
}

const Mapbox: React.FC<MapboxProps> = ({ showMarker = true, disableGeolocation = false }) => {
  // Refs for the map container, map instance, and marker
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // Refs for add pin, roadblock, fire hydrant, and air quality
  const pinRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const roadblockRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const fireHydrantRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const airQualityRef = useRef<Map<string, mapboxgl.Marker>>(new Map());

  // state to track add pin start and end
  const [isAddingPin, setIsAddingPin] = useState(false);

  // State to track map loading and errors
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapPage, setIsMapPage] = useState<boolean>(false);

  const dispatch = useDispatch<AppDispatch>();
  const incident: IIncident = useSelector((state: RootState) => state.incidentState.incident);

  // State for current location
  const [currentLat, setCurrentLat] = useState<number>(40);
  const [currentLng, setCurrentLng] = useState<number>(-74.5);

  // State for the location of the pin
  const [pinLocation, setPinLocation] = useState<{ lng: number; lat: number; address?: string } | null>(null);

  // Check if we're on the /map page
  useEffect(() => {
    const path = window.location.pathname;
    setIsMapPage(path === '/map');
  }, []);

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
        fetchAndRenderMarkers();

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
      // Add geolocate control to allow tracking the user's location (only if not disabled)
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

  const createCustomMarker = (type: string): HTMLElement => {
    const markerElement = document.createElement("div");
  
    // Remove background styles, only render the icon
    markerElement.style.width = "auto";
    markerElement.style.height = "auto";
    markerElement.style.display = "flex";
    markerElement.style.alignItems = "center";
    markerElement.style.justifyContent = "center";
  
    // Choose the correct Material UI icon
    let iconComponent;
    switch (type) {
      case "pin":
        iconComponent = <PushPinIcon style={{color: "gray", fontSize: "32px" , opacity: "80%"}} />;
        break;
      case "roadblock":
        iconComponent = <BlockIcon style={{ color: "gray", fontSize: "32px" , opacity: "80%" }} />;
        break;
      case "fireHydrant":
        iconComponent = <FireHydrantAltIcon style={{ color: "gray", fontSize: "32px" , opacity: "80%"}} />;
        break;
      case "airQuality":
        iconComponent = <CloudIcon style={{ color: "gray", fontSize: "32px" , opacity: "80%" }} />;
        break;
      default:
        iconComponent = <PushPinIcon style={{ color: "gray", fontSize: "32px" , opacity: "80%" }} />;
    }
  
    // Convert the React component into a string and insert into the marker
    markerElement.innerHTML = ReactDOMServer.renderToString(iconComponent);
  
    return markerElement;
  };
  // fetch and render markers from backend
  const fetchAndRenderMarkers = async () => {
    try {
      const response = await fetch('/api/map'); // Fetch all markers from backend
      const data = await response.json();
  
      if (!mapRef.current) return;
  
      data.forEach((item: { _id: string; type: string; latitude: number; longitude: number; description: string }) => {
        // Create popup content with buttons
        const popupContent = document.createElement("div");
        popupContent.id = `popup-container-${item._id}`;
        popupContent.innerHTML = `
          <p id="popup-address-${item._id}">${item.description}</p>
          <button id="edit-pin-${item._id}" style="padding:5px 10px; margin-top:5px; cursor:pointer; background-color: blue; color: white;">Edit</button>
          <button id="delete-pin-${item._id}" style="padding:5px 10px; margin-top:5px; cursor:pointer; background-color: red; color: white;">Delete</button>
        `;
  
        const popup = new mapboxgl.Popup({ offset: 25 }).setDOMContent(popupContent);
  
        // Create marker
        const marker = new mapboxgl.Marker({element: createCustomMarker(item.type), draggable: false })
          .setLngLat([item.longitude, item.latitude])
          .setPopup(popup)
          .addTo(mapRef.current!);
  
        // Store marker in the correct ref based on its type
        switch (item.type) {
          case 'pin':
            pinRef.current.set(item._id, marker);
            break;
          case 'roadblock':
            roadblockRef.current.set(item._id, marker);
            break;
          case 'fireHydrant':
            fireHydrantRef.current.set(item._id, marker);
            break;
          case 'airQuality':
            airQualityRef.current.set(item._id, marker);
            break;
          default:
            console.warn(`Unknown marker type: ${item.type}`);
        }
  
        // Attach event listeners when popup opens
        popup.on('open', () => {
          const editButton = document.getElementById(`edit-pin-${item._id}`);
          const deleteButton = document.getElementById(`delete-pin-${item._id}`);
          const popupContainer = document.getElementById(`popup-container-${item._id}`) as HTMLDivElement;

          if (!editButton || !deleteButton || !popupContainer) {
            console.warn(`Popup elements not found for pin ID: ${item._id}`);
            return;
          }

          // Bind event listeners
          editButton.addEventListener("click", () => 
            handleEditPin(item._id, item.type, popupContainer)
          );

          deleteButton.addEventListener("click", async () => {
            await handleRemovePin(item._id, item.type);
          });
        });
      });
    } catch (error) {
      console.error("Error fetching markers:", error);
    }
  };
  
  
  

// -------------------------------- helper function end --------------------------------




// -------------------------------- map init start --------------------------------

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


// -------------------------------- map init end --------------------------------





// -------------------------------- map drop items features start --------------------------------
    // Function to fetch and render markers from the backend
    const getAddressFromCoordinates = async (lng: number, lat: number): Promise<string | undefined> => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
        );
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          return data.features[0].place_name; // Return the first result
        }
      } catch (error) {
        console.error("Error fetching address:", error);
      }
      return undefined; // Return undefined instead of null
    };

    // Function to add a pin to the map
    const handleAddPin = async (type: string) => {
      if (!mapRef.current || isAddingPin) return;
    
      setIsAddingPin(true); // Disable MapDrop buttons while adding a pin
    
      // Get initial location and address
      const initialLngLat = mapRef.current.getCenter();
      const initialAddress = await getAddressFromCoordinates(initialLngLat.lng, initialLngLat.lat);
    
      const tempId = `temp-${Date.now()}`;
    
      // Create popup content with unique ID
      const popupContent = document.createElement("div");
      popupContent.innerHTML = `
        <p id="popup-address-${tempId}">${initialAddress || "Fetching address..."}</p>
        <button id="confirm-pin-${tempId}" style="padding:5px 10px; margin-top:5px; cursor:pointer;">Confirm</button>
      `;
    
      const popup = new mapboxgl.Popup({ offset: 25 }).setDOMContent(popupContent);
    
      // Create marker (draggable initially)
      const marker = new mapboxgl.Marker({element: createCustomMarker(type), draggable: true })
        .setLngLat(initialLngLat)
        .setPopup(popup)
        .addTo(mapRef.current!);
    
      marker.togglePopup();
    
      // Store in the correct ref based on type
      switch (type) {
        case "roadblock":
          roadblockRef.current.set(tempId, marker);
          break;
        case "fireHydrant":
          fireHydrantRef.current.set(tempId, marker);
          break;
        case "airQuality":
          airQualityRef.current.set(tempId, marker);
          break;
        default:
          pinRef.current.set(tempId, marker);
      }
    
      // Update address when dragging ends
      marker.on("dragend", async () => {
        const newLngLat = marker.getLngLat();
        const newAddress = await getAddressFromCoordinates(newLngLat.lng, newLngLat.lat);
        document.getElementById(`popup-address-${tempId}`)!.innerText = newAddress || "Fetching address...";
      });
    
      // Handle confirmation
      document.getElementById(`confirm-pin-${tempId}`)?.addEventListener("click", async () => {
        marker.setDraggable(false); // Disable dragging
    
        // Send request to backend to create a real pin entry
        const createPinResponse = await fetch('/api/map', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: type,
            latitude: marker.getLngLat().lat,
            longitude: marker.getLngLat().lng,
            description: document.getElementById(`popup-address-${tempId}`)!.innerText,
          }),
        });
    
        if (!createPinResponse.ok) {
          console.error('Failed to create pin on backend');
          return;
        }
    
        const { id } = await createPinResponse.json();
    
        // Replace temporary ID with actual ID from backend
        switch (type) {
          case "roadblock":
            roadblockRef.current.delete(tempId);
            roadblockRef.current.set(id, marker);
            break;
          case "fireHydrant":
            fireHydrantRef.current.delete(tempId);
            fireHydrantRef.current.set(id, marker);
            break;
          case "airQuality":
            airQualityRef.current.delete(tempId);
            airQualityRef.current.set(id, marker);
            break;
          default:
            pinRef.current.delete(tempId);
            pinRef.current.set(id, marker);
        }
    
        // Replace confirm button with delete and edit buttons
        popupContent.innerHTML = `
          <p id="popup-address-${id}">${document.getElementById(`popup-address-${tempId}`)!.innerText}</p>
          <button id="edit-pin-${id}" style="padding:5px 10px; margin-top:5px; cursor:pointer; background-color: blue; color: white;">Edit</button>
          <button id="delete-pin-${id}" style="padding:5px 10px; margin-top:5px; cursor:pointer; background-color: red; color: white;">Delete</button>
        `;
    
        document.getElementById(`delete-pin-${id}`)?.addEventListener("click", async () => {
          await handleRemovePin(id, type);
        });
    
        document.getElementById(`edit-pin-${id}`)?.addEventListener("click", () => handleEditPin(id, type, popupContent));
    
        setIsAddingPin(false); // Re-enable MapDrop buttons after confirmation
      });
    };
    

    // Function to remove a pin from the map
    const handleRemovePin = async (id: string, type: string) => {
      console.log(id, type);
      let marker: mapboxgl.Marker | undefined;
    
      switch (type) {
        case "roadblock":
          marker = roadblockRef.current.get(id);
          roadblockRef.current.delete(id);
          break;
        case "fireHydrant":
          marker = fireHydrantRef.current.get(id);
          fireHydrantRef.current.delete(id);
          break;
        case "airQuality":
          marker = airQualityRef.current.get(id);
          airQualityRef.current.delete(id);
          break;
        default:
          marker = pinRef.current.get(id);
          pinRef.current.delete(id);
      }
    
      if (marker) {
        marker.remove();
        // Also delete from backend
        await fetch(`/api/map/${id}`, { method: 'DELETE' });
      }
    };

    // Function to handle editing a pin's description
    const handleEditPin = (id: string, type: string, popupContent: HTMLDivElement) => {
      const descriptionElement = document.getElementById(`popup-address-${id}`);
      if (!descriptionElement) return console.error("Description element not found");

      const currentDescription = descriptionElement.innerText;

      // Replace text with input field
      popupContent.innerHTML = `
        <input id="edit-description-${id}" type="text" value="${currentDescription}" style="width: 90%; padding: 5px; margin-top: 5px;" />
        <button id="save-edit-${id}" style="padding:5px 10px; margin-top:5px; cursor:pointer; background-color: green; color: white;">Save</button>
      `;

      // Add event listener for saving the edit
      document.getElementById(`save-edit-${id}`)?.addEventListener("click", async () => {
        const newDescription = (document.getElementById(`edit-description-${id}`) as HTMLInputElement).value;

        // Send update request to backend
        const updateResponse = await fetch(`/api/map/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: newDescription }),
        });

        if (!updateResponse.ok) {
          console.error('Failed to update pin description');
          return;
        }

        // Restore popup with updated description
        popupContent.innerHTML = `
          <p id="popup-address-${id}">${newDescription}</p>
          <button id="edit-pin-${id}" style="padding:5px 10px; margin-top:5px; cursor:pointer; background-color: blue; color: white;">Edit</button>
          <button id="delete-pin-${id}" style="padding:5px 10px; margin-top:5px; cursor:pointer; background-color: red; color: white;">Delete</button>
        `;

        // Reattach event listeners
        document.getElementById(`delete-pin-${id}`)?.addEventListener("click", async () => {
          await handleRemovePin(id, type);
        });

        document.getElementById(`edit-pin-${id}`)?.addEventListener("click", () => handleEditPin(id, type, popupContent));
      });
    };

    
    
// -------------------------------- map drop items features end --------------------------------




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
      {isMapPage && (
        <MapDrop
          onDropPin={() => handleAddPin("pin")}
          onDropRoadblock={() => handleAddPin("roadblock")}
          onDropFireHydrant={() => handleAddPin("fireHydrant")}
          onDropAirQuality={() => handleAddPin("airQuality")}
        />
      )}
      {!isMapLoaded && <MapLoading />}
    </div>
  );
};

export default Mapbox;
export const getMapboxToken = () => {
  if (!mapboxgl.accessToken) {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZG9tb25jYXNzaXUiLCJhIjoiY2x1cW9qb3djMDBkNjJoa2NoMG1hbGsyNyJ9.nqTwoyg7Xf4v__5IwYzNDA';
  }
  return mapboxgl.accessToken;
};