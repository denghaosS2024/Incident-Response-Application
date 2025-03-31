import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import FireTruckIcon from '@mui/icons-material/FireTruck'
import FlagIcon from '@mui/icons-material/Flag'
import HomeIcon from '@mui/icons-material/Home'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { Snackbar } from '@mui/material'
import { Geometry } from 'geojson'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import React, { useEffect, useRef, useState } from 'react'
import ReactDOMServer from 'react-dom/server'
import { useDispatch, useSelector } from 'react-redux'
import IHospital from '../../models/Hospital'
import IIncident from '../../models/Incident'
import { updateIncident } from '../../redux/incidentSlice'
import { AppDispatch, RootState } from '../../redux/store'
import eventEmitter from '../../utils/eventEmitter'
import Globals from '../../utils/Globals'
import request from '../../utils/request'
import SocketClient from '../../utils/Socket'
import { WildfireArea } from '../../utils/types'
import AQIData from './AQIData'
import LocationError from './LocationError'
import MapBoxHelper from './MapBoxHelper'
import MapDrop from './MapDrop'
import MapLoading from './MapLoading'

interface MapboxProps {
  showMarker?: boolean
  disableGeolocation?: boolean // New prop to disable geolocation
  autoPopulateData?: boolean
}

// Define interface for AQI data
const Mapbox: React.FC<MapboxProps> = ({
  showMarker = true,
  disableGeolocation = false,
  autoPopulateData,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const socketRef = useRef(SocketClient)

  // Refs for add pin, roadblock, fire hydrant, and air quality
  const pinRef = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const roadblockRef = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const fireHydrantRef = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const airQualityRef = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const hospitalRef = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const incidentRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const truckRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const carRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const sarTaskRef = useRef<Map<string, mapboxgl.Marker>>(new Map()); // New ref for SAR tasks - explicitly initialize with a new Map to avoid null issues

  // Visibility states for the map layers
  const [pinsVisible, setPinsVisible] = useState(true)
  const [roadblocksVisible, setRoadblocksVisible] = useState(true)
  const [fireHydrantsVisible, setFireHydrantsVisible] = useState(true)
  const [airQualityVisible, setAirQualityVisible] = useState(true)
  const [hospitalsVisible, setHospitalsVisible] = useState(true)
  const [userLocationVisible, setUserLocationVisible] = useState(true)
  const [incidentsVisible, setIncidentsVisible] = useState(false);
  const [trucksVisible, setTrucksVisible] = useState(false);
  const [carsVisible, setCarsVisible] = useState(false);
  const [isCreatingArea, setIsCreatingArea] = useState(false)
  const [isUnauthorized, setIsUnauthorized] = useState(false)
  const geoLocateRef = useRef<mapboxgl.GeolocateControl | null>(null)

  // get role from localStorage
  const role = localStorage.getItem('role') ?? 'Citizen'

  // refs for areaClick
  const areaRef = useRef<boolean>(false)

  // state to track add pin start and end
  const [isAddingPin, setIsAddingPin] = useState(false)

  // State to track map loading and errors
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isMapPage, setIsMapPage] = useState<boolean>(false)

  // state to track default areas
  const [areaNum, setAreaNum] = useState<number>(0)

  // State for the route calculation loading
  const [isNaviLoaded, setIsNaviLoaded] = useState(false)

  const dispatch = useDispatch<AppDispatch>()
  const incident: IIncident = useSelector(
    (state: RootState) => state.incidentState.incident,
  )

  // State for current location
  const [currentLat, setCurrentLat] = useState<number>(40)
  const [currentLng, setCurrentLng] = useState<number>(-74.5)

  // State for the location of the pin
  const [pinLocation, setPinLocation] = useState<{
    lng: number
    lat: number
    address?: string
  } | null>(null)

  // state for current wildfire area
  const [currArea, setCurrArea] = useState<WildfireArea[]>([])
  // const [currNamePopup, setNamePopup] = useState<mapboxgl.Popup[]>([]);
  // Refs for popups
  const popupRef = useRef<Map<string, mapboxgl.Popup>>(new Map())

  // Check if we're on the /map page
  useEffect(() => {
    const path = window.location.pathname
    setIsMapPage(path === '/map')
  }, [])

  // -------------------------------- helper function start --------------------------------

  // Function to update the util layer visibility based on the markers present on the map
  const checkForUtilMarkers = () => {
    const hasPins = pinRef.current.size > 0
    const hasRoadblocks = roadblockRef.current.size > 0
    const hasHydrants = fireHydrantRef.current.size > 0
    const hasAirQuality = airQualityRef.current.size > 0
    const hasHospitals = hospitalRef.current.size > 0
    const hasIncidents = incidentRef.current.size > 0
    const hasTrucks = truckRef.current.size > 0
    const hasCars = carRef.current.size > 0

    // Check which layers are actually visible based on state
    if (
      hasPins || 
      hasRoadblocks || 
      hasHydrants || 
      hasAirQuality || 
      hasHospitals || 
      hasIncidents || 
      hasTrucks || 
      hasCars
    ) {
      // Emit event to mark the main Util button as active
      eventEmitter.emit('utilVisibility', { layer: 'Util', visible: true })

      // Emit events for each util type that exists and is visible
      if (hasPins && pinsVisible) {
        eventEmitter.emit('utilVisibility', { layer: 'Pins', visible: true })
      }
      if (hasRoadblocks && roadblocksVisible) {
        eventEmitter.emit('utilVisibility', { layer: 'Blocks', visible: true })
      }
      if (hasHydrants && fireHydrantsVisible) {
        eventEmitter.emit('utilVisibility', { layer: 'Hydrants', visible: true })
      }
      if (hasAirQuality && airQualityVisible) {
        eventEmitter.emit('utilVisibility', { layer: 'Pollution', visible: true })
      }
      if (hasHospitals && hospitalsVisible) {
        eventEmitter.emit('utilVisibility', { layer: 'Hospitals', visible: true })
      }
      if (hasIncidents && incidentsVisible) {
        eventEmitter.emit('utilVisibility', { layer: 'Incidents', visible: true })
      }
      if (hasTrucks && trucksVisible) {
        eventEmitter.emit('utilVisibility', { layer: 'Trucks', visible: true })
      }
      if (hasCars && carsVisible) {
        eventEmitter.emit('utilVisibility', { layer: 'Cars', visible: true })
      }
    }
  }

  // Function to initialize the map using the given longitude and latitude.
  // This function is called once regardless of geolocation success or failure.
  const initializeMap = (lng: number, lat: number, initialZoom: number) => {
    if (!mapContainerRef.current) return
    try {
      // Create a new map instance
      if (disableGeolocation) {
        initialZoom = 14
      }

      // Clean up existing map instance if it exists
      if (mapRef.current) {
        try {
          mapRef.current.remove()
        } catch (err) {
          console.error('Error cleaning up map:', err)
        }
      }

      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/domoncassiu/cm7og9k1l005z01rdd6l78pdf',
        center: [lng, lat],
        zoom: initialZoom,
      })
      // When the map loads, add a draggable marker and update the address
      mapRef.current?.on('load', () => {
        // Add a draggable marker at the current location
        mapRef.current!.setProjection({ name: 'globe' })
        fetchAndRenderMarkers().then(() => {
          checkForUtilMarkers()
        })

        // Emit an event that the map is loaded
        eventEmitter.emit('map_loaded', mapRef.current)
        setIsMapLoaded(true)

        // If showMarker is true, add a draggable marker
        if (showMarker) {
          markerRef.current = new mapboxgl.Marker({
            draggable: true,
            color: '#FF0000',
          })
            .setLngLat([lng, lat])
            .addTo(mapRef.current!)
          markerRef.current.on('dragend', () => {
            const lngLat = markerRef.current!.getLngLat()
            updateAddressFromCoordinates(lngLat.lng, lngLat.lat)
          })

          // Update address and location initially if they're not already set
          const hasLocation =
            incident.location?.latitude && incident.location?.longitude

          // If we don't have a location or the location doesn't match our current coordinates,
          // update from the coordinates (this ensures the pin and address stay in sync)
          if (
            !hasLocation ||
            (hasLocation &&
              (Math.abs(incident.location!.latitude - lat) > 0.0001 ||
                Math.abs(incident.location!.longitude - lng) > 0.0001))
          ) {
            updateAddressFromCoordinates(lng, lat)
          }
        }
        setIsMapLoaded(true)

        // Trigger geolocation if the map was initialized with default coordinates
        if (initialZoom == 1 && !disableGeolocation) {
          try {
            geoLocateRef.current?.trigger()
          } catch (err) {
            console.error('Error triggering geolocation:', err)
          }
        }

        // Add click event for SAR task location selection
        mapRef.current?.on('click', (e) => {
          // Emit the clicked location for SAR tasks
          eventEmitter.emit('map_clicked', {
            longitude: e.lngLat.lng,
            latitude: e.lngLat.lat
          });
        });
      })
      // Handle map errors
      mapRef.current?.on('error', (e: any) => {
        console.error('Mapbox error:', e)
        setMapError('Failed to load map')
      })
      // Add geolocate control to allow tracking the user's location (only if not disabled)
      // let geolocateControl: mapboxgl.GeolocateControl | null = null
      if (!disableGeolocation) {
        geoLocateRef.current = new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          showAccuracyCircle: true,
          showUserLocation: true,
        })
        mapRef.current?.addControl(geoLocateRef.current)
        // Update marker position when geolocation is triggered
        geoLocateRef.current?.on('geolocate', (e: any) => {
          const { longitude, latitude } = e.coords
          if (markerRef.current && showMarker) {
            markerRef.current.setLngLat([longitude, latitude])
            updateAddressFromCoordinates(longitude, latitude)
          }
        })

        // Add error handler for geolocation errors
        geoLocateRef.current?.on('error', (error: any) => {
          console.error('Geolocation error:', error)
          setMapError(
            'Unable to get your location. Please enter your address manually.',
          )
        })
      }
    } catch (error) {
      console.error('Error initializing map:', error)
      setMapError('Failed to initialize map')
    }
  }

  const createCustomMarker = (type: string, aqiData?: AQIData): HTMLElement => {
    const markerElement = document.createElement('div')

    // Remove background styles, only render the icon
    markerElement.style.width = 'auto'
    markerElement.style.height = 'auto'
    markerElement.style.display = 'flex'
    markerElement.style.alignItems = 'center'
    markerElement.style.justifyContent = 'center'

    // Convert the React component into a string and insert into the marker
    markerElement.innerHTML = ReactDOMServer.renderToString(
      MapBoxHelper.getMarkerIcon(type, aqiData),
    )

    return markerElement
  }
  // fetch and render markers from backend
  const fetchAndRenderMarkers = async () => {
    try {
      const response = await request('/api/map') // Fetch all markers from backend
      const data = await response

      if (!mapRef.current) return

      for (const item of data) {
        // Destructure the item for easier access
        const { _id, type, latitude, longitude, description } = item

        // If it's an air quality marker, fetch AQI data
        let aqiData: AQIData | undefined
        if (type === 'airQuality') {
          aqiData = await MapBoxHelper.fetchAQIData(longitude, latitude)
        }

        // Create popup content with buttons
        const popupContent = document.createElement('div')
        popupContent.id = `popup-container-${_id}`

        if (type === 'airQuality') {
          // For air quality markers, create specialized popup content
          popupContent.innerHTML = `
            <div style="min-width: 200px;">
              <div style="background-color: #f0f0f0; padding: 8px; margin-bottom: 8px;">
                <p style="margin: 0;">US EPA PM2.5 AQI is now ${aqiData?.value ?? 'N/A'}</p>
              </div>
              <div style="background-color: ${aqiData?.color}; color: white; padding: 8px; margin-bottom: 8px;">
                <p style="margin: 0 0 5px 0;">Air quality is ${aqiData?.level ?? 'no data'}</p>
                <p style="margin: 0 0 5px 0;">Measurement quality is ${aqiData?.measurementQuality ?? 'no data'}</p>
                <p style="margin: 0 0 5px 0;">Evolution over the last 24 hours:</p>
                <div id="trending-icon-${_id}" style="cursor: pointer;">
                  ${ReactDOMServer.renderToString(<TrendingUpIcon style={{ color: 'white' }} />)}
                </div>
              </div>
              <p id="popup-address-${_id}">${description}</p>
              <div style="display: flex; justify-content: space-between;">
                <button id="edit-pin-${_id}" style="padding:5px 10px; margin-top:5px; cursor:pointer; background-color: blue; color: white;">Edit</button>
                <button id="delete-pin-${_id}" style="padding:5px 10px; margin-top:5px; cursor:pointer; background-color: red; color: white;">Delete</button>
                <button id="navigate-pin-${item._id}" style="padding:5px 10px; margin-top:5px; cursor:pointer; background-color: green; color: white;">Navigate</button>
              </div>
            </div>
          `
        } else {
          // For other marker types, use the standard popup content
          popupContent.innerHTML = `
            <p id="popup-address-${_id}">${description}</p>
            <button id="edit-pin-${_id}" style="padding:5px 10px; margin-top:5px; cursor:pointer; background-color: blue; color: white;">Edit</button>
            <button id="delete-pin-${_id}" style="padding:5px 10px; margin-top:5px; cursor:pointer; background-color: red; color: white;">Delete</button>
            <button id="navigate-pin-${item._id}" style="padding:5px 10px; margin-top:5px; cursor:pointer; background-color: green; color: white;">Navigate</button>
          `
        }

        const popup = new mapboxgl.Popup({ offset: 25 }).setDOMContent(
          popupContent,
        )

        // Create marker
        const marker = new mapboxgl.Marker({
          element: createCustomMarker(type, aqiData),
          draggable: false,
        })
          .setLngLat([longitude, latitude])
          .setPopup(popup)
          .addTo(mapRef.current!)

        // Store marker in the correct ref based on its type
        switch (type) {
          case 'pin':
            pinRef.current.set(_id, marker)
            break
          case 'roadblock':
            roadblockRef.current.set(_id, marker)
            break
          case 'fireHydrant':
            fireHydrantRef.current.set(_id, marker)
            break
          case 'airQuality':
            airQualityRef.current.set(_id, marker)
            break
          default:
            console.warn(`Unknown marker type: ${type}`)
        }

        // Attach event listeners when popup opens
        popup.on('open', () => {
          const editButton = document.getElementById(`edit-pin-${_id}`)
          const deleteButton = document.getElementById(`delete-pin-${_id}`)
          const navigateButton = document.getElementById(`navigate-pin-${_id}`)
          const popupContainer = document.getElementById(
            `popup-container-${_id}`,
          ) as HTMLDivElement

          const trendingIcon = document.getElementById(`trending-icon-${_id}`)

          if (
            !editButton ||
            !deleteButton ||
            !navigateButton ||
            !popupContainer
          ) {
            console.warn(`Popup elements not found for pin ID: ${_id}`)
            return
          }

          // Bind event listeners
          editButton.addEventListener('click', () =>
            handleEditPin(_id, type, popupContainer),
          )

          deleteButton.addEventListener('click', async () => {
            await handleRemovePin(_id, type)
          })

          navigateButton.addEventListener('click', () => {
            if (mapRef.current) {
              setIsNaviLoaded(true)
              MapBoxHelper.navigateToMarker(
                mapRef.current,
                item.longitude,
                item.latitude,
                () => setIsNaviLoaded(false),
              )
            } else {
              console.error('Map reference is not available.')
            }
          })

          // Add event listener for trending icon if it exists
          if (trendingIcon) {
            trendingIcon.addEventListener('click', () => {
              if (aqiData?.value === null || aqiData?.value === undefined) {
                alert('No AQI data available for trends')
              } else {
                alert(
                  `Showing AQI trends for the last 24 hours. Current value: ${aqiData.value}`,
                )
                // In a real implementation, this would show a chart or detailed data
              }
            })
          }
        })
      }
    } catch (error) {
      console.error('Error fetching markers:', error)
    }
  }

  // Function to fetch AQI data

  // -------------------------------- helper function end --------------------------------

  // -------------------------------- map init start --------------------------------

  useEffect(() => {
    mapboxgl.accessToken = Globals.getMapboxToken()

    // For main map page (/map), always prioritize geolocation
    if (isMapPage) {
      useGeolocationOrDefault()
    }
    // For other pages (like 911), use incident location if available
    else if (incident.location?.latitude && incident.location?.longitude) {
      const { latitude, longitude } = incident.location
      setCurrentLat(latitude)
      setCurrentLng(longitude)
      initializeMap(longitude, latitude, 14)
    }
    // If we have an address but no location, geocode the address to get coordinates
    else if (incident.address && incident.address.trim() !== '') {
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(incident.address)}.json?access_token=${mapboxgl.accessToken}`,
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.features && data.features.length > 0) {
            const [lng, lat] = data.features[0].center
            setCurrentLat(lat)
            setCurrentLng(lng)
            initializeMap(lng, lat, 14)

            // Update incident with location coordinates from address
            if (!autoPopulateData) {
              dispatch(
                updateIncident({
                  ...incident,
                  location: {
                    latitude: lat,
                    longitude: lng,
                  },
                }),
              )
            }
          } else {
            // If geocoding fails, fall back to geolocation or default
            useGeolocationOrDefault()
          }
        })
        .catch((error) => {
          console.error('Error geocoding address:', error)
          useGeolocationOrDefault()
        })
    }
    // Otherwise, try to use geolocation
    else {
      useGeolocationOrDefault()
    }

    // Helper function to use geolocation or default coordinates
    function useGeolocationOrDefault() {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            setCurrentLat(latitude)
            setCurrentLng(longitude)
            // Initialize the map with the user's coordinates
            initializeMap(longitude, latitude, 1)
          },
          (error) => {
            initializeMap(-122.05964, 37.410271, 14)
          },
        )
      } else {
        console.log('Geolocation is not supported by this browser.')
        setMapError(
          'Geolocation is not supported by your browser. Please enter your address manually.',
        )
        // Initialize with default coordinates if geolocation is not supported
        initializeMap(-74.5, 40, 14)
      }
    }

    // Cleanup: remove the map instance on unmount
    return () => {
      if (mapRef.current) {
        try {
          // First remove any markers to prevent the 'indoor' error
          if (markerRef.current) {
            markerRef.current.remove()
          }

          // Clear all marker references
          pinRef.current.forEach((marker) => marker.remove())
          roadblockRef.current.forEach((marker) => marker.remove())
          fireHydrantRef.current.forEach((marker) => marker.remove())
          airQualityRef.current.forEach((marker) => marker.remove())
          incidentRef.current.forEach(marker => marker.remove())
          truckRef.current.forEach(marker => marker.remove())
          carRef.current.forEach(marker => marker.remove())
          sarTaskRef.current.forEach(marker => marker.remove()) // Remove SAR task markers

          pinRef.current.clear()
          roadblockRef.current.clear()
          fireHydrantRef.current.clear()
          airQualityRef.current.clear()
          incidentRef.current.clear()
          truckRef.current.clear()
          carRef.current.clear()
          sarTaskRef.current.clear() // Clear SAR task markers

          // Remove the map itself
          mapRef.current.remove()
        } catch (err) {
          console.error('Error during map cleanup:', err)
        }
      }
    }
  }, [
    showMarker,
    disableGeolocation,
    incident.location,
    incident.address,
    isMapPage,
  ])

  // -------------------------------- map init end --------------------------------

  // -------------------------------- map drop items features start --------------------------------
  // Function to fetch and render markers from the backend
  const getAddressFromCoordinates = async (
    lng: number,
    lat: number,
  ): Promise<string | undefined> => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`,
      )
      const data = await response.json()

      if (data.features && data.features.length > 0) {
        return data.features[0].place_name // Return the first result
      }
    } catch (error) {
      console.error('Error fetching address:', error)
    }
    return undefined // Return undefined instead of null
  }

  // Function to add a pin to the map
  const handleAddPin = async (type: string) => {
    if (!mapRef.current || isAddingPin) return

    setIsAddingPin(true) // Disable MapDrop buttons while adding a pin

    // Get initial location and address
    const initialLngLat = mapRef.current.getCenter()
    const initialAddress = await getAddressFromCoordinates(
      initialLngLat.lng,
      initialLngLat.lat,
    )

    const tempId = `temp-${Date.now()}`

    // Create popup content with unique ID
    const popupContent = document.createElement('div')

    if (type === 'airQuality') {
      // Simplified popup content for air quality markers before confirmation
      popupContent.innerHTML = `
        <p id="popup-address-${tempId}">${initialAddress || 'Fetching address...'}</p>
        <button id="confirm-pin-${tempId}" style="padding:5px 10px; margin-top:5px; cursor:pointer;">Confirm</button>
      `
    } else {
      // Standard popup content for other marker types
      popupContent.innerHTML = `
        <p id="popup-address-${tempId}">${initialAddress || 'Fetching address...'}</p>
        <button id="confirm-pin-${tempId}" style="padding:5px 10px; margin-top:5px; cursor:pointer;">Confirm</button>
      `
    }

    const popup = new mapboxgl.Popup({ offset: 25 }).setDOMContent(popupContent)

    // Create marker (draggable initially)
    const marker = new mapboxgl.Marker({
      element: createCustomMarker(type), // Don't pass aqiData initially
      draggable: true,
    })
      .setLngLat(initialLngLat)
      .setPopup(popup)
      .addTo(mapRef.current!)

    marker.togglePopup()

    // Store in the correct ref based on type
    switch (type) {
      case 'pin':
        pinRef.current.set(tempId, marker)
        break
      case 'roadblock':
        roadblockRef.current.set(tempId, marker)
        break
      case 'fireHydrant':
        fireHydrantRef.current.set(tempId, marker)
        break
      case 'airQuality':
        airQualityRef.current.set(tempId, marker)
        break
      default:
        console.warn(`Unknown marker type: ${type}`)
    }

    // When marker is dragged to a new location
    marker.on('dragend', async () => {
      const lngLat = marker.getLngLat()
      const address = await getAddressFromCoordinates(lngLat.lng, lngLat.lat)

      // For all marker types, just update the address
      const addressElement = document.getElementById(`popup-address-${tempId}`)
      if (addressElement) {
        addressElement.textContent = address || 'Address not found'
      }
    })

    // Handle confirmation
    document
      .getElementById(`confirm-pin-${tempId}`)
      ?.addEventListener('click', async () => {
        marker.setDraggable(false) // Disable dragging

        // Send request to backend to create a real pin entry
        const createPinResponse = await request('/api/map', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: type,
            latitude: marker.getLngLat().lat,
            longitude: marker.getLngLat().lng,
            description: document.getElementById(`popup-address-${tempId}`)!
              .innerText,
          }),
        })

        const { id } = await createPinResponse

        // Replace temporary ID with actual ID from backend
        let finalLngLat: mapboxgl.LngLat | undefined
        let finalAqiData: AQIData | undefined
        let finalMarker: mapboxgl.Marker | undefined

        switch (type) {
          case 'roadblock':
            roadblockRef.current.delete(tempId)
            roadblockRef.current.set(id, marker)
            break
          case 'fireHydrant':
            fireHydrantRef.current.delete(tempId)
            fireHydrantRef.current.set(id, marker)
            break
          case 'airQuality':
            // For air quality markers, now we fetch the AQI data
            finalLngLat = marker.getLngLat()
            finalAqiData = await MapBoxHelper.fetchAQIData(
              finalLngLat.lng,
              finalLngLat.lat,
            )
            // Store the AQI data of the marker to the backend
            // const { locationId, latitude, longitude, air_quality, timeStamp } = req.body;
            await MapBoxHelper.storeAQIData(id, finalLngLat, finalAqiData)

            // Create specialized popup content for confirmed air quality marker
            popupContent.innerHTML = `
              <div style="min-width: 200px;">
                <div style="background-color: #f0f0f0; padding: 8px; margin-bottom: 8px;">
                  <p style="margin: 0;">US EPA PM2.5 AQI is now ${finalAqiData?.value ?? 'N/A'}</p>
                </div>
                <div style="background-color: ${finalAqiData?.color}; color: white; padding: 8px; margin-bottom: 8px;">
                  <p style="margin: 0 0 5px 0;">Air quality is ${finalAqiData?.level ?? 'no data'}</p>
                  <p style="margin: 0 0 5px 0;">Measurement quality is ${finalAqiData?.measurementQuality ?? 'no data'}</p>
                  <p style="margin: 0 0 5px 0;">Evolution over the last 24 hours:</p>
                  <div id="trending-icon-${id}" style="cursor: pointer;">
                    ${ReactDOMServer.renderToString(<TrendingUpIcon style={{ color: 'white' }} />)}
                  </div>
                </div>
                <p id="popup-address-${id}">${document.getElementById(`popup-address-${tempId}`)!.innerText}</p>
                <div style="display: flex; justify-content: space-between;">
                  <button id="edit-pin-${id}" style="padding:5px 10px; margin-top:5px; cursor:pointer; background-color: blue; color: white;">Edit</button>
                  <button id="delete-pin-${id}" style="padding:5px 10px; margin-top:5px; cursor:pointer; background-color: red; color: white;">Delete</button>
                  <button id="navigate-pin-${id}" style="padding:5px 10px; margin-top:5px; cursor:pointer; background-color: green; color: white;">Navigate</button>
                </div>
              </div>
            `

            // Remove the old marker and create a new one with the AQI data
            marker.remove()

            // Create a new marker with the AQI data
            finalMarker = new mapboxgl.Marker({
              element: createCustomMarker(type, finalAqiData),
              draggable: false,
            })
              .setLngLat(finalLngLat)
              .setPopup(popup)
              .addTo(mapRef.current!)

            // Update the marker reference
            airQualityRef.current.delete(tempId)
            airQualityRef.current.set(id, finalMarker)

            // Attach event listeners when the popup opens, similar to how it's done for existing markers
            popup.on('open', () => {
              const editButton = document.getElementById(`edit-pin-${id}`)
              const deleteButton = document.getElementById(`delete-pin-${id}`)
              const navigateButton = document.getElementById(`navigate-pin-${id}`)
              const trendingIcon = document.getElementById(
                `trending-icon-${id}`,
              )

              if (editButton && deleteButton && navigateButton) {
                // Bind event listeners
                editButton.addEventListener('click', () =>
                  handleEditPin(id, type, popupContent),
                )
                deleteButton.addEventListener(
                  'click',
                  async () => await handleRemovePin(id, type),
                )
                navigateButton.addEventListener('click', () => {
                  if (mapRef.current) {
                    setIsNaviLoaded(true)
                    MapBoxHelper.navigateToMarker(
                      mapRef.current,
                      marker.getLngLat().lng,
                      marker.getLngLat().lat,
                      () => setIsNaviLoaded(false),
                    )
                  } else {
                    console.error('Map reference is not available.')
                  }
                })
              }

              // Add event listener for trending icon if it exists
              if (trendingIcon) {
                trendingIcon.addEventListener('click', () => {
                  if (
                    finalAqiData?.value === null ||
                    finalAqiData?.value === undefined
                  ) {
                    alert('No AQI data available for trends')
                  } else {
                    alert(
                      `Showing AQI trends for the last 24 hours. Current value: ${finalAqiData?.value ?? 'unknown'}`,
                    )
                  }
                })
              }
            })
            break
          default:
            pinRef.current.delete(tempId)
            pinRef.current.set(id, marker)
        }

        // For non-air quality markers, update the popup content
        if (type !== 'airQuality') {
          // Replace confirm button with delete and edit buttons
          popupContent.innerHTML = `
          <p id="popup-address-${id}">${document.getElementById(`popup-address-${tempId}`)!.innerText}</p>
          <button id="edit-pin-${id}" style="padding:5px 10px; margin-top:5px; cursor:pointer; background-color: blue; color: white;">Edit</button>
          <button id="delete-pin-${id}" style="padding:5px 10px; margin-top:5px; cursor:pointer; background-color: red; color: white;">Delete</button>
            <button id="navigate-pin-${id}" style="padding:5px 10px; margin-top:5px; cursor:pointer; background-color: green; color: white;">Navigate</button>
          `

          // Create a new popup with the updated content
          const updatedPopup = new mapboxgl.Popup({ offset: 25 }).setDOMContent(
            popupContent,
          )

          // Replace the marker's popup
          marker.setPopup(updatedPopup)

          // Attach event listeners when the popup opens, like we did for air quality markers
          updatedPopup.on('open', () => {
            const editButton = document.getElementById(`edit-pin-${id}`)
            const deleteButton = document.getElementById(`delete-pin-${id}`)
            const navigateButton = document.getElementById(`navigate-pin-${id}`)

            if (editButton && deleteButton && navigateButton) {
              // Bind event listeners
              editButton.addEventListener('click', () =>
                handleEditPin(id, type, popupContent),
              )
              deleteButton.addEventListener(
                'click',
                async () => await handleRemovePin(id, type),
              )
              navigateButton.addEventListener('click', () => {
                if (mapRef.current) {
                  setIsNaviLoaded(true)
                  MapBoxHelper.navigateToMarker(
                    mapRef.current,
                    marker.getLngLat().lng,
                    marker.getLngLat().lat,
                    () => setIsNaviLoaded(false),
                  )
                } else {
                  console.error('Map reference is not available.')
                }
              })
            }
          })
        }

        setIsAddingPin(false) // Re-enable MapDrop buttons after confirmation
      })
  }

  // Function to remove a pin from the map
  const handleRemovePin = async (id: string, type: string) => {
    console.log(id, type)
    let marker: mapboxgl.Marker | undefined

    switch (type) {
      case 'roadblock':
        marker = roadblockRef.current.get(id)
        roadblockRef.current.delete(id)
        break
      case 'fireHydrant':
        marker = fireHydrantRef.current.get(id)
        fireHydrantRef.current.delete(id)
        break
      case 'airQuality':
        marker = airQualityRef.current.get(id)
        airQualityRef.current.delete(id)
        await MapBoxHelper.deleteAQIData(id)
        break
      default:
        marker = pinRef.current.get(id)
        pinRef.current.delete(id)
    }

    if (marker) {
      marker.remove()
      // Also delete from backend
      await request(`/api/map/${id}`, { method: 'DELETE' })
    }
  }

  // Function to handle editing a pin's description
  const handleEditPin = (
    id: string,
    type: string,
    popupContent: HTMLDivElement,
  ) => {
    const descriptionElement = document.getElementById(`popup-address-${id}`)
    if (!descriptionElement)
      return console.error('Description element not found')

    const currentDescription = descriptionElement.innerText

    // Replace text with input field
    popupContent.innerHTML = `
        <input id="edit-description-${id}" type="text" value="${currentDescription}" style="width: 90%; padding: 5px; margin-top: 5px;" />
        <button id="save-edit-${id}" style="padding:5px 10px; margin-top:5px; cursor:pointer; background-color: green; color: white;">Save</button>
      `

    // Add event listener for saving the edit
    document
      .getElementById(`save-edit-${id}`)
      ?.addEventListener('click', async () => {
        const newDescription = (
          document.getElementById(`edit-description-${id}`) as HTMLInputElement
        ).value

        // Send update request to backend
        const updateResponse = await request(`/api/map/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: newDescription }),
        })

        // if (!updateResponse.ok) {
        //   console.error('Failed to update pin description')
        //   return
        // }

        // Restore popup with updated description
        popupContent.innerHTML = `
          <p id="popup-address-${id}">${newDescription}</p>
          <button id="edit-pin-${id}" style="padding:5px 10px; margin-top:5px; cursor:pointer; background-color: blue; color: white;">Edit</button>
          <button id="delete-pin-${id}" style="padding:5px 10px; margin-top:5px; cursor:pointer; background-color: red; color: white;">Delete</button>
          <button id="navigate-pin-${id}" style="padding:5px 10px; margin-top:5px; cursor:pointer; background-color: green; color: white;">Navigate</button>
        `

        // Reattach event listeners
        document
          .getElementById(`delete-pin-${id}`)
          ?.addEventListener('click', async () => {
            await handleRemovePin(id, type)
          })

        document
          .getElementById(`edit-pin-${id}`)
          ?.addEventListener('click', () =>
            handleEditPin(id, type, popupContent),
          )
      })
  }

  // -------------------------------- map drop items features end --------------------------------

  // -------------------------------- map layer toggle start --------------------------------
  const fetchAndDisplayIncidents = async () => {
    try {
        // Fetch Assigned incidents
        const response = await request('/api/incidents?incidentState=Assigned');
        const incidents = await response;
        
        if (!mapRef.current) return;
        
        for (const incident of incidents) {
            if (!incident.address) continue;
            
            try {
                // Geocoding address to obtain coordinates
                const geocodeResponse = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(incident.address)}.json?access_token=${mapboxgl.accessToken}`
                );
                const geocodeData = await geocodeResponse.json();
                
                if (geocodeData.features && geocodeData.features.length > 0) {
                    const [lng, lat] = geocodeData.features[0].center;
                    
                    // Create flag mark
                    const markerElement = document.createElement('div');
                    markerElement.innerHTML = ReactDOMServer.renderToString(
                        <FlagIcon style={{ color: 'gray', fontSize: '32px' }} />
                    );
                    
                    // Create popup content
                    const popupContent = document.createElement('div');
                    popupContent.innerHTML = `
                        <h3 style="margin: 0 0 5px 0; font-size: 14px;">Incident: ${incident.incidentId}</h3>
                        <p style="margin: 0 0 5px 0; font-size: 12px;">${incident.address}</p>
                        <p style="margin: 0; font-size: 12px;">Status: ${incident.incidentState}</p>
                    `;
                    
                    const popup = new mapboxgl.Popup({ offset: 25 })
                        .setDOMContent(popupContent);
                    
                    // Create and add tags
                    const marker = new mapboxgl.Marker({ element: markerElement })
                        .setLngLat([lng, lat])
                        .setPopup(popup)
                        .addTo(mapRef.current);
                    
                    incidentRef.current.set(incident.incidentId, marker);
                }
            } catch (error) {
                console.error(`Error geocoding incident address: ${incident.address}`, error);
            }
        }
    } catch (error) {
        console.error('Error fetching incidents:', error);
    }
  };

  const fetchAndDisplayTrucks = async () => {
    try {
        // Fetch all users
        const response = await request('/api/users');
        const allUsers = await response;
        
        if (!mapRef.current) return;

        const userWithTruck = allUsers.find((user: any) => 
          user.assignedTruck !== null 
        );
        
        let longitude = userWithTruck.previousLongitude;
        let latitude = userWithTruck.previousLatitude;

        if (longitude === 0 && latitude === 0) {
          // Use default location
          longitude = -122.05964;
          latitude = 37.410271;
        }
        
        // Create firetruck mark
        const markerElement = document.createElement('div');
        markerElement.innerHTML = ReactDOMServer.renderToString(
            <FireTruckIcon style={{ color: 'gray', fontSize: '32px' }} />
        );
        
        // Create popup content
        const popupContent = document.createElement('div');
        popupContent.innerHTML = `
            <h3 style="margin: 0 0 5px 0; font-size: 14px;">Truck: ${userWithTruck.assignedTruck}</h3>
            <p style="margin: 0 0 5px 0; font-size: 12px;">Driver: ${userWithTruck.username}</p>
            <p style="margin: 0; font-size: 12px;">Role: ${userWithTruck.role}</p>
        `;
        
        const popup = new mapboxgl.Popup({ offset: 25 })
            .setDOMContent(popupContent);
        
        // Create and add tags
        const marker = new mapboxgl.Marker({ element: markerElement })
            .setLngLat([longitude, latitude])
            .setPopup(popup)
            .addTo(mapRef.current);
        
        truckRef.current.set(userWithTruck._id, marker);
        
    } catch (error) {
        console.error('Error fetching trucks:', error);
    }
  };

  // 獲取並顯示 cars
  const fetchAndDisplayCars = async () => {
    try {
        // Fetch all users
        const response = await request('/api/users');
        const allUsers = await response;
        
        if (!mapRef.current) return;

        const userWithCar = allUsers.find((user: any) => 
          user.assignedCar !== null 
        );
        
        let longitude = userWithCar.previousLongitude;
        let latitude = userWithCar.previousLatitude;

        if (longitude === 0 && latitude === 0) {
          // Use default location
          longitude = -122.05964;
          latitude = 37.410271;
        }
        
        // Create car mark
        const markerElement = document.createElement('div');
        markerElement.innerHTML = ReactDOMServer.renderToString(
            <DirectionsCarIcon style={{ color: 'gray', fontSize: '32px' }} />
        );
        
        // Create popup content
        const popupContent = document.createElement('div');
        popupContent.innerHTML = `
            <h3 style="margin: 0 0 5px 0; font-size: 14px;">Car: ${userWithCar.assignedCar}</h3>
            <p style="margin: 0 0 5px 0; font-size: 12px;">Driver: ${userWithCar.username}</p>
            <p style="margin: 0; font-size: 12px;">Role: ${userWithCar.role}</p>
        `;
        
        const popup = new mapboxgl.Popup({ offset: 25 })
            .setDOMContent(popupContent);
        
        // Create and add tags
        const marker = new mapboxgl.Marker({ element: markerElement })
            .setLngLat([longitude, latitude])
            .setPopup(popup)
            .addTo(mapRef.current);
        
        carRef.current.set(userWithCar._id, marker);
        
    } catch (error) {
        console.error('Error fetching cars:', error);
    }
  };

  useEffect(() => {
    // Toggle pins visibility at the component level
    const togglePins = () => {
      if (!mapRef.current) return
      setPinsVisible((prev) => {
        const newState = !prev

        pinRef.current.forEach((marker) => {
          const markerElement = marker.getElement()

          markerElement.style.visibility = newState ? 'visible' : 'hidden'

          // This is to handle the popup visibility
          // If the popup is open and the pins are hidden, close the popup
          const popup = marker.getPopup()
          if (!newState && popup) {
            if (popup.isOpen()) {
              marker.togglePopup()
            }
          }
        })

        eventEmitter.emit('utilVisibility', {
          layer: 'Pins',
          visible: newState,
        })

        return newState
      })
    }

    // Toggle air quality visibility at the component level
    const toggleAirQuality = () => {
      if (!mapRef.current) return
      setAirQualityVisible((prev) => {
        const newState = !prev

        airQualityRef.current.forEach((marker) => {
          const markerElement = marker.getElement()
          markerElement.style.visibility = newState ? 'visible' : 'hidden'

          // Handle popup visibility
          const popup = marker.getPopup()
          if (!newState && popup) {
            if (popup.isOpen()) {
              marker.togglePopup()
            }
          }
        })

        eventEmitter.emit('utilVisibility', {
          layer: 'Pollution',
          visible: newState,
        })

        return newState
      })
    }

    const toggleRoadblocks = () => {
      if (!mapRef.current) return
      setRoadblocksVisible((prev) => {
        const newState = !prev

        roadblockRef.current.forEach((marker) => {
          const markerElement = marker.getElement()
          markerElement.style.visibility = newState ? 'visible' : 'hidden'

          const popup = marker.getPopup()
          if (!newState && popup) {
            if (popup.isOpen()) {
              marker.togglePopup()
            }
          }
        })

        eventEmitter.emit('utilVisibility', {
          layer: 'Blocks',
          visible: newState,
        })

        return newState
      })
    }

    const toggleFireHydrants = () => {
      if (!mapRef.current) return
      setFireHydrantsVisible((prev) => {
        const newState = !prev

        fireHydrantRef.current.forEach((marker) => {
          const markerElement = marker.getElement()
          markerElement.style.visibility = newState ? 'visible' : 'hidden'

          const popup = marker.getPopup()
          if (!newState && popup) {
            if (popup.isOpen()) {
              marker.togglePopup()
            }
          }
        })

        eventEmitter.emit('utilVisibility', {
          layer: 'Hydrants',
          visible: newState,
        })

        return newState
      })
    }

    const toggleUserLocation = () => {
      if (!mapRef.current) return

      setUserLocationVisible((prev) => {
        const newState = !prev

        const userLocationMarker = document.querySelector(
          '.mapboxgl-user-location-dot',
        ) as HTMLElement | null
        const userLocationAccuracy = document.querySelector(
          '.mapboxgl-user-location-accuracy-circle',
        ) as HTMLElement | null
        if (userLocationMarker && userLocationAccuracy) {
          userLocationMarker.style.visibility = newState ? 'visible' : 'hidden'
          userLocationAccuracy.style.visibility = newState
            ? 'visible'
            : 'hidden'
        }

        return newState
      })
    }

    // Toggle hospitals visibility at the component level
    const toggleHospitals = () => {
      if (!mapRef.current) return
      setHospitalsVisible((prev) => {
        const newState = !prev

        hospitalRef.current.forEach((marker) => {
          const markerElement = marker.getElement()
          markerElement.style.visibility = newState ? 'visible' : 'hidden'

          // Handle popup visibility
          const popup = marker.getPopup()
          if (!newState && popup) {
            if (popup.isOpen()) {
              marker.togglePopup()
            }
          }
        })

        eventEmitter.emit('utilVisibility', {
          layer: 'Hospitals',
          visible: newState,
        })

        return newState
      })
    }

    const toggleIncidents = async () => {
      if (!mapRef.current) return;
      
      setIncidentsVisible(prev => {
          const newState = !prev;
          
          if (newState) {
              // display incidents
              fetchAndDisplayIncidents();
          } else {
              // hide incidents
              incidentRef.current.forEach(marker => marker.remove());
              incidentRef.current.clear();
          }
          
          return newState;
      });
  };

  const toggleTrucks = async () => {
      if (!mapRef.current) return;
      
      setTrucksVisible(prev => {
          const newState = !prev;
          
          if (newState) {
              // display trucks
              fetchAndDisplayTrucks();
          } else {
              // hide trucks
              truckRef.current.forEach(marker => marker.remove());
              truckRef.current.clear();
          }
          
          return newState;
      });
  };

  const toggleCars = async () => {
      if (!mapRef.current) return;
      
      setCarsVisible(prev => {
          const newState = !prev;
          
          if (newState) {
              // display cars
              fetchAndDisplayCars();
          } else {
              // hide cars
              carRef.current.forEach(marker => marker.remove());
              carRef.current.clear();
          }
          
          return newState;
      });
  };

    eventEmitter.on('you_button_clicked', toggleUserLocation)
    eventEmitter.on('toggle_pin', togglePins)
    eventEmitter.on('toggle_roadblock', toggleRoadblocks)
    eventEmitter.on('toggle_fireHydrant', toggleFireHydrants)
    eventEmitter.on('toggle_airQuality', toggleAirQuality)
    eventEmitter.on('toggle_hospital', toggleHospitals)
    eventEmitter.on('toggle_incidents', toggleIncidents);
    eventEmitter.on('toggle_trucks', toggleTrucks);
    eventEmitter.on('toggle_cars', toggleCars);
    // Remove the area_util listener that's causing errors
    // eventEmitter.on('area_util', toggleAreaUtil)

    return () => {
      eventEmitter.removeListener('you_button_clicked', toggleUserLocation)
      eventEmitter.removeListener('toggle_pin', togglePins)
      eventEmitter.removeListener('toggle_roadblock', toggleRoadblocks)
      eventEmitter.removeListener('toggle_fireHydrant', toggleFireHydrants)
      eventEmitter.removeListener('toggle_airQuality', toggleAirQuality)
      eventEmitter.removeListener('toggle_hospital', toggleHospitals)
      eventEmitter.removeListener('toggle_incidents', toggleIncidents);
      eventEmitter.removeListener('toggle_trucks', toggleTrucks);
      eventEmitter.removeListener('toggle_cars', toggleCars);
      // Remove the area_util listener that's causing errors
      // eventEmitter.off('area_util', toggleAreaUtil)
    }
  }, [])

  // -------------------------------- map layer toggle end --------------------------------

  // -------------------------------- reach 911 features start --------------------------------

  // Function to update the address using Mapbox's Geocoding API based on longitude and latitude
  const updateAddressFromCoordinates = async (lng: number, lat: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`,
      )
      const data = await response.json()
      if (data.features && data.features.length > 0) {
        const address = data.features[0].place_name
        if (!autoPopulateData) {
          // Update both address and location together to ensure they stay in sync
          dispatch(
            updateIncident({
              ...incident,
              address: address,
              location: {
                latitude: lat,
                longitude: lng,
              },
            }),
          )
        }
      }
    } catch (error) {
      console.error('Error fetching address:', error)
    }
  }

  // When incident.address changes (from external updates), update the marker position
  useEffect(() => {
    if (
      mapRef.current &&
      markerRef.current &&
      incident.address &&
      incident.address.trim() !== ''
    ) {
      // Only update marker if we're not currently dragging
      if (!(markerRef.current as any)._isDragging) {
        fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(incident.address)}.json?access_token=${mapboxgl.accessToken}`,
        )
          .then((response) => response.json())
          .then((data) => {
            if (data.features && data.features.length > 0) {
              const [lng, lat] = data.features[0].center
              markerRef.current!.setLngLat([lng, lat])
              mapRef.current!.flyTo({
                center: [lng, lat],
                zoom: 14,
              })

              // Update incident with precise location coordinates
              if (!autoPopulateData) {
                dispatch(
                  updateIncident({
                    ...incident,
                    location: {
                      latitude: lat,
                      longitude: lng,
                    },
                  }),
                )
              }
            }
          })
          .catch((error) => {
            console.error('Error geocoding address:', error)
          })
      }
    }
    // Handle empty address case gracefully - keep existing marker position
  }, [incident.address, dispatch, autoPopulateData])

  // Handle changes to location directly
  useEffect(() => {
    if (
      mapRef.current &&
      markerRef.current &&
      incident.location?.latitude &&
      incident.location?.longitude
    ) {
      const { latitude, longitude } = incident.location

      // Update marker position when location changes directly (e.g., when restored after emptying address)
      markerRef.current.setLngLat([longitude, latitude])

      // Only fly to the location if address is empty (to avoid competing with address-based updates)
      if (!incident.address || incident.address.trim() === '') {
        mapRef.current.flyTo({
          center: [longitude, latitude],
          zoom: 14,
        })
      }

      // If address is empty but we have coordinates, geocode to update the address
      if (
        (!incident.address || incident.address.trim() === '') &&
        !autoPopulateData
      ) {
        fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}`,
        )
          .then((response) => response.json())
          .then((data) => {
            if (data.features && data.features.length > 0) {
              const address = data.features[0].place_name
              dispatch(
                updateIncident({
                  ...incident,
                  address: address,
                  // Don't update location again to avoid loop
                }),
              )
            }
          })
          .catch((error) => {
            console.error('Error reverse geocoding:', error)
          })
      }
    }
  }, [incident.location, dispatch, autoPopulateData])

  // -------------------------------- reach 911 features end --------------------------------

  // -------------------------------- wildfire features start --------------------------------

  const createArea = (
    e: mapboxgl.MapMouseEvent & { features: mapboxgl.GeoJSONFeature[] },
  ) => {
    const data = MapBoxHelper.getMapboxDraw().getAll()
    if (data.features.length > 0 && mapRef.current) {
      const areaId: string = e.features[0]?.id?.toString() ?? ''
      if (areaId == '') return
      const geometry = e.features[0].geometry as Geometry & { coordinates: any }
      const coordinates = geometry.coordinates
      let areaIndex = -1
      data.features.find((feature, index) => {
        if (feature.id === areaId) {
          console.log('Matched feature index:', index)
          areaIndex = index
          return true
        }
        return false
      })
      // const areaName: string = generateDefaultName()
      const areaName = 'Area'

      // Add properties to the feature
      if (areaIndex >= 0) {
        data.features[areaIndex].properties = {
          areaId: areaId,
          name: areaName,
        }
      } else {
        return
      }

      const bodyJson = JSON.stringify({
        name: areaName,
        coordinates: coordinates[0],
        areaId: areaId,
      })

      request('/api/wildfire/areas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: bodyJson,
      })
        .then((data) => {
          console.log('Successfully posted WildfireArea:', data)
        })
        .catch((error) => {
          console.error('Error posting WildfireArea:', error)
        })
      createWildfirePopup({
        areaId,
        coordinates: coordinates[0],
        name: areaName,
      })
    }
  }

  const updatePopup = (wildfireArea: WildfireArea) => {
    const areaId = wildfireArea.areaId
    const coordinates = wildfireArea.coordinates
    const areaName = wildfireArea.name

    if (popupRef.current.has(areaId)) {
      deletePopup(wildfireArea.areaId)
    }
    createWildfirePopup(wildfireArea)
  }

  const createWildfirePopup = (wildfireArea: WildfireArea) => {
    const areaId = wildfireArea.areaId
    const coordinates = wildfireArea.coordinates
    const areaName = wildfireArea.name

    const popupContent = document.createElement('div')
    popupContent.innerHTML = `
      <span id="area-name-display-${areaId}" style="cursor: pointer;">${areaName}</span>
      <input id="area-name-input-${areaId}" type="text" value="${areaName}" style="display: none; width: 70%; padding: 5px; margin-top: 5px;" />
      <button id="area-name-checkbox-${areaId}" style="display: none; margin-left: 5px;">Save</button>
    `
    const centerCoord = coordinates
      .reduce(
        (acc, coord) => {
          acc[0] += coord[0]
          acc[1] += coord[1]
          return acc
        },
        [0, 0],
      )
      .map((sum: number) => sum / coordinates.length) as [number, number]
    const popup = new mapboxgl.Popup({
      offset: -25,
      closeButton: false,
      closeOnClick: false,
      className: 'transparent-popup',
    })
      .setLngLat(centerCoord)
      .setDOMContent(popupContent)
      .addTo(mapRef.current!)
    const style = document.createElement('style')
    style.innerHTML = `
    .transparent-popup .mapboxgl-popup-content {
        background: transparent;
        border: none;
        box-shadow: none;
    }
    .transparent-popup .mapboxgl-popup-tip {
        display: none;
    }
`
    document.head.appendChild(style)

    const nameDisplay = document.getElementById(`area-name-display-${areaId}`)
    const nameInput = document.getElementById(
      `area-name-input-${areaId}`,
    ) as HTMLInputElement
    const nameCheckbox = document.getElementById(
      `area-name-checkbox-${areaId}`,
    ) as HTMLInputElement

    nameDisplay?.addEventListener('click', () => {
      if (role !== 'Fire') {
        setIsUnauthorized(true)
        return
      }
      nameDisplay.style.display = 'none'
      nameInput.style.display = 'block'
      nameCheckbox.style.display = 'block'
      nameInput.focus()
    })

    nameCheckbox?.addEventListener('click', () => {
      const previousName = nameDisplay?.innerText || ''
      const newName = nameInput.value

      if (nameDisplay) {
        if (newName != previousName) {
          nameDisplay.innerText = newName || previousName

          MapBoxHelper.updateWildfireArea(wildfireArea, newName)
            .then((data) => {
              console.log('Successfully updated WildfireArea name:', data)
            })
            .catch((error) => {
              console.error('Error updating WildfireArea name:', error)
            })
        }
        nameDisplay.style.display = 'block'
      }
      nameInput.style.display = 'none'
      nameCheckbox.style.display = 'none'
    })
    popupRef.current.set(areaId, popup)
  }

  const deletePopup = (areaId: string) => {
    popupRef.current.get(areaId)?.remove()
    popupRef.current.delete(areaId)
  }

  const deleteAllPopups = () => {
    popupRef.current.forEach((_, areaId) => {
      deletePopup(areaId)
    })
    popupRef.current.clear()
  }

  const deleteArea = (
    e: mapboxgl.MapMouseEvent & { features: mapboxgl.GeoJSONFeature[] },
  ) => {
    const draw = MapBoxHelper.getMapboxDraw()
    const data = draw.getAll()
    // delete the popup as well

    if (role !== 'Fire') {
      setIsUnauthorized(true)
      draw.changeMode('simple_select')
      return
    }

    const areaId: string = e.features[0]?.id?.toString() ?? ''
    if (areaId == '') return

    MapBoxHelper.deleteWildfireArea(areaId)
      .then(() => {
        console.log('Successfully deleted WildfireArea:', areaId)
        deletePopup(areaId)
      })
      .catch((error) => {
        console.error('Error deleting WildfireArea:', error)
      })
  }

  const updateArea = (
    e: mapboxgl.MapMouseEvent & { features: mapboxgl.GeoJSONFeature[] },
  ) => {
    // const data = draw.getAll();
  }

  const displayHint = (
    e: mapboxgl.MapMouseEvent & { features: mapboxgl.GeoJSONFeature[] },
  ) => {
    const draw = MapBoxHelper.getMapboxDraw()

    // const data = draw.getAll();
    const mode = draw.getMode()
    console.log(mode)
    if (mode === 'draw_polygon') {
      // Check if the user has Fire role
      if (role === 'Fire') {
        setIsCreatingArea(true)
      } else {
        setIsCreatingArea(false)
        setIsUnauthorized(true)
        draw.changeMode('simple_select')
      }
    } else {
      setIsCreatingArea(false)
    }
  }

  const selectRestrict = (
    e: mapboxgl.MapMouseEvent & { features: mapboxgl.GeoJSONFeature[] },
  ) => {
    // const data = draw.getAll();
    if (role !== 'Fire') {
      setIsUnauthorized(true)
      MapBoxHelper.getMapboxDraw().changeMode('simple_select')
    }
  }

  const addDrawControls = () => {
    if (!mapRef.current) return

    mapRef.current.addControl(MapBoxHelper.getMapboxDraw())

    mapRef.current.on('draw.create', createArea)
    mapRef.current.on('draw.delete', deleteArea)
    mapRef.current.on('draw.update', updateArea)
    mapRef.current.on('draw.modechange', displayHint)
    mapRef.current.on('draw.selectionchange', selectRestrict)
    displayAllArea()

    const socket = socketRef.current
    socket.on('map-area-update', (wildfireArea) => {
      console.log('socket 1: ', wildfireArea)
      drawArea(wildfireArea)
    })
    socket.on('map-area-delete', (areaId) => {
      console.log('socket 2: ', areaId)
      removeAreaById(areaId)
    })
  }

  const removeDrawControls = () => {
    if (!mapRef.current) return

    mapRef.current.removeControl(MapBoxHelper.getMapboxDraw())

    mapRef.current.off('draw.create', createArea)
    mapRef.current.off('draw.delete', deleteArea)
    mapRef.current.off('draw.update', updateArea)
    mapRef.current.off('draw.modechange', displayHint)
    mapRef.current.off('draw.selectionchange', selectRestrict)
    setIsCreatingArea(false)
    // remove all names
    deleteAllPopups()
    const socket = socketRef.current
    socket.off('map-area-update')
    socket.off('map-area-delete')
  }

  const displayAllArea = () => {
    const fetchWildfireAreas = async () => {
      try {
        const response = await request('/api/wildfire/areas')
        const data = await response
        setCurrArea(data)
        data.forEach((wildfireArea: WildfireArea) => {
          drawArea(wildfireArea)
        })
      } catch (error) {
        console.error('Error fetching wildfire areas:', error)
      }
    }

    fetchWildfireAreas()
  }

  const drawArea = (wildfireArea: WildfireArea) => {
    const draw = MapBoxHelper.getMapboxDraw()

    const existingPolygon = draw.get(wildfireArea.areaId)
    if (!existingPolygon) {
      const newPolygon = draw.add({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [wildfireArea.coordinates],
        },
        id: wildfireArea.areaId,
        properties: {
          areaId: wildfireArea.areaId,
          name: wildfireArea.name,
        },
      })
    }

    updatePopup(wildfireArea)
  }

  const removeArea = () => {
    const draw = MapBoxHelper.getMapboxDraw()

    const data = draw.getAll()
    if (data.features.length > 0) {
      data.features.forEach((feature) => {
        if (feature.id) {
          draw.delete(feature.id.toString())
        }
      })
    }
    deleteAllPopups()
  }

  const removeAreaById = (areaId: string) => {
    const draw = MapBoxHelper.getMapboxDraw()

    draw.delete(areaId)
    deletePopup(areaId)
  }

  const generateDefaultName = () => {
    const newAreaNum = areaNum + 1
    setAreaNum(newAreaNum)
    return `Area ${newAreaNum}`
  }

  // Function to update an air quality marker when new data is received
  const updateAirQualityMarker = async (
    locationId: string,
    newAqi: number,
    timestamp: number,
    latitude: number,
    longitude: number,
  ) => {
    // Find the marker in our reference
    const marker = airQualityRef.current.get(locationId)
    if (!marker) {
      console.log(`No air quality marker found for locationId: ${locationId}`)
      return
    }

    // Create new AQI data object
    const aqiLevel = MapBoxHelper.aqiToLevel(newAqi)
    const aqiColor = MapBoxHelper.aqiLevelToColor(aqiLevel)
    const aqiData = {
      value: newAqi,
      level: aqiLevel,
      color: aqiColor,
      timeStamp: timestamp,
      measurementQuality: await MapBoxHelper.getMeasurementQuality(
        longitude,
        latitude,
      ),
    } as AQIData

    // Update marker appearance
    const newElement = createCustomMarker('airQuality', aqiData)
    marker.getElement().innerHTML = newElement.innerHTML

    // Update the popup content
    const popup = marker.getPopup()
    if (!popup) return

    const popupElement = popup.getElement()

    if (popupElement && popup.isOpen()) {
      // Only update content if popup is currently open
      const popupContent = document.createElement('div')

      // Safely get the address element and its text content
      const addressElement = popupElement.querySelector(
        `#popup-address-${locationId}`,
      )
      const addressText = addressElement?.textContent || ''

      const aqiPopup = MapBoxHelper.spawnAqiPopup(
        aqiData,
        locationId,
        addressText,
        timestamp,
      )

      // Replace popup content
      popup.setDOMContent(aqiPopup)

      // Reattach event listeners
      const editButton = document.getElementById(`edit-pin-${locationId}`)
      const deleteButton = document.getElementById(`delete-pin-${locationId}`)
      const navigateButton = document.getElementById(
        `navigate-pin-${locationId}`,
      )
      const trendingIcon = document.getElementById(
        `trending-icon-${locationId}`,
      )

      if (editButton && deleteButton && navigateButton) {
        editButton.addEventListener('click', () =>
          handleEditPin(locationId, 'airQuality', popupContent),
        )

        deleteButton.addEventListener(
          'click',
          async () => await handleRemovePin(locationId, 'airQuality'),
        )

        navigateButton.addEventListener('click', () => {
          if (mapRef.current) {
            setIsNaviLoaded(true)
            MapBoxHelper.navigateToMarker(
              mapRef.current,
              marker.getLngLat().lng,
              marker.getLngLat().lat,
              () => setIsNaviLoaded(false),
            )
          }
        })
      }

      if (trendingIcon) {
        trendingIcon.addEventListener('click', () => {
          alert(
            `Showing AQI trends for the last 24 hours. Current value: ${newAqi}`,
          )
        })
      }
    }

    console.log(
      `Updated air quality marker ${locationId} with new AQI: ${newAqi}`,
    )
  }

  useEffect(() => {
    const socket = socketRef.current
    socket.connect()
    // Add air quality update listener
    socket.on('airQualityUpdate', (data) => {
      updateAirQualityMarker(
        data.locationId,
        data.air_quality,
        data.timestamp,
        data.latitude,
        data.longitude,
      )
    })
    eventEmitter.on('area_util', () => {
      if (areaRef.current) {
        removeDrawControls()
      } else {
        addDrawControls()
      }
      areaRef.current = !areaRef.current
    })

    return () => {
      eventEmitter.removeAllListeners('area_util')
      socket.off('map-area-update')
      socket.off('map-area-delete') // Clean up the listener
      socket.off('airQualityUpdate') // Clean up the listener
    }
  }, [])

  // Function to update SAR task markers on the map
  const updateSARTaskMarkers = (tasks: any[]) => {
    if (!mapRef.current) return;

    // Clear existing SAR task markers
    sarTaskRef.current.forEach(marker => marker.remove());
    sarTaskRef.current.clear();

    // Add new markers for each SAR task
    tasks.forEach(task => {
      if (task.location && task.location.latitude && task.location.longitude) {
        // Create marker element with appropriate icon based on status
        const markerElement = document.createElement('div');
        
        // Set icon based on task status
        if (task.status === 'done') {
          // Green CheckCircleIcon for done tasks
          markerElement.innerHTML = ReactDOMServer.renderToString(
            <CheckCircleIcon style={{ color: '#4caf50', fontSize: '32px' }} />
          );
        } else if (task.status === 'in-progress') {
          // Blue HomeIcon for in-progress tasks
          markerElement.innerHTML = ReactDOMServer.renderToString(
            <HomeIcon style={{ color: '#2196f3', fontSize: '32px' }} />
          );
        } else {
          // Red HomeIcon for todo tasks
          markerElement.innerHTML = ReactDOMServer.renderToString(
            <HomeIcon style={{ color: '#f44336', fontSize: '32px' }} />
          );
        }

        // Create popup content
        const popupContent = document.createElement('div');
        popupContent.innerHTML = `
          <h3 style="margin: 0 0 5px 0; font-size: 14px;">${task.name}</h3>
          <p style="margin: 0 0 5px 0; font-size: 12px;">${task.description || 'No description'}</p>
          <p style="margin: 0 0 5px 0; font-size: 12px;">${task.address || 'No address'}</p>
          <p style="margin: 0; font-size: 12px;">Status: ${task.status}</p>
        `;

        const popup = new mapboxgl.Popup({ offset: 25 })
          .setDOMContent(popupContent);

        // Create and add marker
        const marker = new mapboxgl.Marker({ element: markerElement })
          .setLngLat([task.location.longitude, task.location.latitude])
          .setPopup(popup)
          .addTo(mapRef.current!);

        // Store the marker in the ref
        sarTaskRef.current.set(task.id, marker);
      }
    });
  };

  useEffect(() => {
    eventEmitter.on('update_sar_tasks', updateSARTaskMarkers);
    return () => {
      eventEmitter.removeListener('update_sar_tasks', updateSARTaskMarkers);
    }
  }, []);

  // -------------------------------- wildfire features end --------------------------------

  // Fetch all hospitals and display them on the map
  const fetchAndDisplayHospitals = async () => {
    try {
      if (!mapRef.current) return

      // Clear any existing hospital markers
      hospitalRef.current.forEach((marker) => marker.remove())
      hospitalRef.current.clear()

      // Fetch hospitals from API
      const response = await request('/api/hospital')
      const hospitals = response as IHospital[]

      for (const hospital of hospitals) {
        // Skip if missing address
        if (!hospital.hospitalAddress) continue

        // Geocode hospital address to get coordinates
        try {
          const geocodeResponse = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(hospital.hospitalAddress)}.json?access_token=${mapboxgl.accessToken}`,
          )
          const geocodeData = await geocodeResponse.json()

          if (geocodeData.features && geocodeData.features.length > 0) {
            const [lng, lat] = geocodeData.features[0].center

            // Create popup content
            const popupContent = document.createElement('div')
            popupContent.innerHTML = `
              <h3 style="margin: 0 0 5px 0; font-size: 14px;">${hospital.hospitalName}</h3>
              <p style="margin: 0 0 5px 0; font-size: 12px;">${hospital.hospitalAddress}</p>
              <p style="margin: 0; font-size: 12px;">ER Beds: ${hospital.totalNumberERBeds || 0}</p>
              <p style="margin: 0; font-size: 12px;">Available: ${(hospital.totalNumberERBeds || 0) - (hospital.totalNumberOfPatients || 0)}</p>
            `

            // Create popup
            const popup = new mapboxgl.Popup({
              offset: 25,
              closeButton: true,
              closeOnClick: true,
            }).setDOMContent(popupContent)

            // Create custom hospital marker element
            const markerElement = document.createElement('div')
            markerElement.className = 'hospital-marker'
            markerElement.style.width = '35px'
            markerElement.style.height = '35px'
            markerElement.style.backgroundImage =
              'url(https://cdn-icons-png.flaticon.com/512/33/33777.png)'
            markerElement.style.backgroundSize = 'cover'
            markerElement.style.borderRadius = '50%'
            markerElement.style.cursor = 'pointer'

            // Create and add the marker
            const marker = new mapboxgl.Marker(markerElement)
              .setLngLat([lng, lat])
              .setPopup(popup)
              .addTo(mapRef.current)

            // Store marker reference
            hospitalRef.current.set(hospital.hospitalId, marker)

            // Set visibility based on current state
            if (!hospitalsVisible) {
              const markerElement = marker.getElement()
              markerElement.style.visibility = 'hidden'
            }
          }
        } catch (error) {
          console.error(
            `Error geocoding hospital address: ${hospital.hospitalAddress}`,
            error,
          )
        }
      }

      // Mark hospitals layer as active if any hospitals are displayed
      if (hospitalRef.current.size > 0) {
        eventEmitter.emit('selectUtil', { layer: 'Hospitals', visible: true })
        eventEmitter.emit('utilVisibility', {
          layer: 'Hospitals',
          visible: true,
        })
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error)
    }
  }

  // Load hospitals when map initializes
  useEffect(() => {
    if (mapRef.current && isMapLoaded) {
      fetchAndDisplayHospitals()
    }
  }, [isMapLoaded])

  // If there is a map error, display a fallback UI
  if (mapError) {
    return <LocationError errorText={mapError} />
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '400px',
          borderRadius: '8px',
          overflow: 'hidden',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
      />
      {isCreatingArea && (
        <Snackbar
          open={isCreatingArea}
          message={
            <span>
              <strong>Usage:</strong> Tap to choose vertex of the area. Double
              tap to add the last vertex.
            </span>
          }
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          ContentProps={{
            style: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '4px',
              borderRadius: '8px',
            },
          }}
          style={{ marginTop: '90px', width: '60%', left: '20%' }}
        />
      )}
      {isUnauthorized && (
        <Snackbar
          open={isUnauthorized}
          autoHideDuration={6000}
          onClose={() => setIsUnauthorized(false)}
          message={
            <span>
              <strong>Warning:</strong> This Feature requires{' '}
              <strong>Fire Fighter</strong> Role
            </span>
          }
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          ContentProps={{
            style: {
              backgroundColor: 'rgba(255, 0, 0, 0.8)',
              color: 'white',
              padding: '4px',
              borderRadius: '8px',
            },
          }}
          style={{ marginTop: '90px', width: '60%', left: '20%' }}
        />
      )}
      {isMapPage && (
        <MapDrop
          onDropPin={() => handleAddPin('pin')}
          onDropRoadblock={() => handleAddPin('roadblock')}
          onDropFireHydrant={() => handleAddPin('fireHydrant')}
          onDropAirQuality={() => handleAddPin('airQuality')}
        />
      )}
      {(!isMapLoaded || isNaviLoaded) && <MapLoading />}
    </div>
  )
}

export default Mapbox
