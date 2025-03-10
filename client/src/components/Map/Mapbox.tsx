import MapboxDraw from '@mapbox/mapbox-gl-draw'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import BlockIcon from '@mui/icons-material/Block'
import CloudIcon from '@mui/icons-material/Cloud'
import FireHydrantAltIcon from '@mui/icons-material/FireHydrantAlt'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PushPinIcon from '@mui/icons-material/PushPin'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { Alert, Box, Typography } from '@mui/material'
import { Geometry } from 'geojson'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import React, { useEffect, useRef, useState } from 'react'
import ReactDOMServer from 'react-dom/server'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '../../app/store'
import { updateIncident } from '../../features/incidentSlice'
import IIncident from '../../models/Incident'
import eventEmitter from '../../utils/eventEmitter'
import request from '../../utils/request'
import SocketClient from '../../utils/Socket'
import { RootState, WildfireArea } from '../../utils/types'
import MapDrop from './MapDrop'
import MapLoading from './MapLoading'

interface MapboxProps {
  showMarker?: boolean
  disableGeolocation?: boolean // New prop to disable geolocation
}

// Define interface for AQI data
interface AQIData {
  value: number | null
  level: 'Unknown' | 'Good' | 'Moderate' | 'Poor' | 'Hazardous'
  color: string
  timeStamp?: number
}

const Mapbox: React.FC<MapboxProps> = ({
  showMarker = true,
  disableGeolocation = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)

  // Refs for add pin, roadblock, fire hydrant, and air quality
  const pinRef = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const roadblockRef = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const fireHydrantRef = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const airQualityRef = useRef<Map<string, mapboxgl.Marker>>(new Map())

  // Visibility states for the map layers
  const [pinsVisible, setPinsVisible] = useState(true)
  const [roadblocksVisible, setRoadblocksVisible] = useState(true)
  const [fireHydrantsVisible, setFireHydrantsVisible] = useState(true)
  const [userLocationVisible, setUserLocationVisible] = useState(true)
  const geoLocateRef = useRef<mapboxgl.GeolocateControl | null>(null)

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

    if (hasPins || hasRoadblocks || hasHydrants) {
      // Emit event to mark the main Util button as active
      eventEmitter.emit('selectUtil', { layer: 'Util', visible: true })

      // Emit events for each util type that exists
      if (hasPins) {
        eventEmitter.emit('selectUtil', { layer: 'Pins', visible: true })
      }
      if (hasRoadblocks) {
        eventEmitter.emit('selectUtil', { layer: 'Blocks', visible: true })
      }
      if (hasHydrants) {
        eventEmitter.emit('selectUtil', { layer: 'Hydrants', visible: true })
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
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/domoncassiu/cm7og9k1l005z01rdd6l78pdf',
        center: [lng, lat],
        zoom: initialZoom,
      })
      // When the map loads, add a draggable marker and update the address
      mapRef.current.on('load', () => {
        // Add a draggable marker at the current location
        mapRef.current!.setProjection({ name: 'globe' })
        fetchAndRenderMarkers().then(() => {
          checkForUtilMarkers()
        })

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
          // Update address initially
          updateAddressFromCoordinates(lng, lat)
        }
        setIsMapLoaded(true)

        // Trigger geolocation if the map was initialized with default coordinates
        if (initialZoom == 1 && !disableGeolocation) {
          geoLocateRef.current!.trigger()
        }
      })
      // Handle map errors
      mapRef.current.on('error', (e: any) => {
        console.error('Mapbox error:', e)
        setMapError('Failed to load map')
      })
      // Add geolocate control to allow tracking the user's location (only if not disabled)
      // let geolocateControl: mapboxgl.GeolocateControl | null = null
      if (!disableGeolocation) {
        geoLocateRef.current = new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
        })
        mapRef.current.addControl(geoLocateRef.current)
        // Update marker position when geolocation is triggered
        geoLocateRef.current.on('geolocate', (e: any) => {
          const { longitude, latitude } = e.coords
          if (markerRef.current && showMarker) {
            markerRef.current.setLngLat([longitude, latitude])
            updateAddressFromCoordinates(longitude, latitude)
          }
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

    // Choose the correct Material UI icon
    let iconComponent
    // Pre-define variables used in the switch cases
    let markerColor = ''

    switch (type) {
      case 'pin':
        iconComponent = (
          <PushPinIcon
            style={{ color: 'gray', fontSize: '32px', opacity: '80%' }}
          />
        )
        break
      case 'roadblock':
        iconComponent = (
          <BlockIcon
            style={{ color: 'gray', fontSize: '32px', opacity: '80%' }}
          />
        )
        break
      case 'fireHydrant':
        iconComponent = (
          <FireHydrantAltIcon
            style={{ color: 'gray', fontSize: '32px', opacity: '80%' }}
          />
        )
        break
      case 'airQuality':
        // Use the AQI data to determine the marker color, default to black for no data
        markerColor = aqiData ? aqiData.color : '#000000'

        iconComponent = (
          <div style={{ position: 'relative' }}>
            <CloudIcon
              style={{ color: markerColor, fontSize: '32px', opacity: '80%' }}
            />
            {aqiData && aqiData.value !== null && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  textShadow: '0px 0px 2px rgba(0,0,0,0.8)',
                }}
              >
                {aqiData.value}
              </div>
            )}
          </div>
        )
        break
      default:
        iconComponent = (
          <PushPinIcon
            style={{ color: 'gray', fontSize: '32px', opacity: '80%' }}
          />
        )
    }

    // Convert the React component into a string and insert into the marker
    markerElement.innerHTML = ReactDOMServer.renderToString(iconComponent)

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
          aqiData = await fetchAQIData(longitude, latitude)
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
                <p style="margin: 0 0 5px 0;">Measurement quality is high</p>
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
              navigateToMarker(
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

  const accessToken =
    'pk.eyJ1IjoiZG9tb25jYXNzaXUiLCJhIjoiY204Mnlqc3ZzMWxuNjJrcTNtMTFjOTUyZiJ9.isQSr9JMLSztiJol_nQSDA'

  const navigateToMarker = async (
    map: mapboxgl.Map | null,
    lng: number,
    lat: number,
    stopLoading: () => void, // ✅ Pass function instead of state setter
  ) => {
    if (!map) {
      console.error('Map instance is not available.')
      stopLoading() // ✅ Ensure loading is stopped if there's an error
      return
    }

    console.log('Loading started')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLng = position.coords.longitude
        const userLat = position.coords.latitude

        const routeUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLng},${userLat};${lng},${lat}?alternatives=true&geometries=geojson&language=en&overview=full&steps=true&access_token=${accessToken}`
        try {
          const query = await fetch(
            routeUrl,

            { method: 'GET' },
          )

          const json = await query.json()
          const data = json.routes[0]
          const route = data.geometry

          if (map.getSource('route')) {
            map.removeLayer('route')
            map.removeSource('route')
          }

          map.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route,
            },
          })

          map.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#007aff',
              'line-width': 4,
            },
          })

          const bounds = new mapboxgl.LngLatBounds()
          route.coordinates.forEach((coord: [number, number]) =>
            bounds.extend(coord),
          )

          map.fitBounds(bounds, { padding: 50 })
        } catch (error) {
          console.error('Error fetching directions:', error)
        } finally {
          console.log('Loading stopped')
          stopLoading() // ✅ Ensure loading stops after fetching
        }
      },
      (error) => {
        console.error('Error getting user location:', error)
        stopLoading()
      },
    )
  }

  // Function to fetch AQI data
  const fetchAQIData = async (lng: number, lat: number): Promise<AQIData> => {
    try {
      // Get AQI data from the backend
      const response = await fetch(
        `/api/airQuality?latitude=${lat}&longitude=${lng}`,
      )
      const data = await response.json()
      const { air_quality } = data

      // Determine AQI level and color based on value
      const aqiLevel = aqiToLevel(air_quality)
      const aqiColor = aqiLevelToColor(aqiLevel)
      return {
        value: air_quality,
        level: aqiLevel,
        color: aqiColor,
        timeStamp: data.timeStamp,
      }
    } catch (error) {
      console.error('Error fetching AQI data:', error)
      return { value: null, level: 'Unknown', color: '#000000' } // Black for no data
    }
  }

  // Funtion to Convert US EPA AQI to AQI level
  // Unknown when no data is available; Good (<50); Moderate (50-100); Poor (101-300); Hazardous (>300)
  const aqiToLevel = (
    aqi: number | string,
  ): 'Unknown' | 'Good' | 'Moderate' | 'Poor' | 'Hazardous' => {
    if (typeof aqi === 'number') {
      if (aqi < 50) return 'Good'
      if (aqi <= 100) return 'Moderate'
      if (aqi <= 300) return 'Poor'
      return 'Hazardous'
    } else {
      return 'Unknown'
    }
  }

  // Function to convert AQI level to color
  // Black for Unknown air quality; Green for Good (<50); Orange for Moderate (50-100); Red for Poor (101-300); Dark Purple for Hazardous (>300)
  const aqiLevelToColor = (
    level: 'Unknown' | 'Good' | 'Moderate' | 'Poor' | 'Hazardous',
  ): string => {
    switch (level) {
      case 'Good':
        return '#00e400' // Green
      case 'Moderate':
        return '#ff7e00' // Orange
      case 'Poor':
        return '#ff0000' // Red
      case 'Hazardous':
        return '#8f3f97' // Dark purple
      default:
        return '#000000' // Black
    }
  }

  // -------------------------------- helper function end --------------------------------

  // -------------------------------- map init start --------------------------------

  useEffect(() => {
    mapboxgl.accessToken =
      'pk.eyJ1IjoiZG9tb25jYXNzaXUiLCJhIjoiY204Mnlqc3ZzMWxuNjJrcTNtMTFjOTUyZiJ9.isQSr9JMLSztiJol_nQSDA'

    // If geolocation is available, get the user's current position
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

    // Cleanup: remove the map instance on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
      }
    }
  }, [showMarker, disableGeolocation])

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
            finalAqiData = await fetchAQIData(finalLngLat.lng, finalLngLat.lat)
            // Store the AQI data of the marker to the backend
            // const { locationId, latitude, longitude, air_quality, timeStamp } = req.body;
            await fetch('/api/airQuality', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                locationId: id,
                latitude: finalLngLat.lat,
                longitude: finalLngLat.lng,
                air_quality: finalAqiData.value,
                timeStamp: finalAqiData?.timeStamp ?? Date.now(),
              }),
            })

            // Create specialized popup content for confirmed air quality marker
            popupContent.innerHTML = `
              <div style="min-width: 200px;">
                <div style="background-color: #f0f0f0; padding: 8px; margin-bottom: 8px;">
                  <p style="margin: 0;">US EPA PM2.5 AQI is now ${finalAqiData?.value ?? 'N/A'}</p>
                </div>
                <div style="background-color: ${finalAqiData?.color}; color: white; padding: 8px; margin-bottom: 8px;">
                  <p style="margin: 0 0 5px 0;">Air quality is ${finalAqiData?.level ?? 'no data'}</p>
                  <p style="margin: 0 0 5px 0;">Measurement quality is high</p>
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
              const navigateButton = document.getElementById(
                `navigate-pin-${id}`,
              )
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
                    navigateToMarker(
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
                  navigateToMarker(
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
        await fetch(`/api/airQuality/`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locationId: id }),
        })
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

    eventEmitter.on('you_button_clicked', toggleUserLocation)
    eventEmitter.on('toggle_pin', togglePins)
    eventEmitter.on('toggle_roadblock', toggleRoadblocks)
    eventEmitter.on('toggle_fireHydrant', toggleFireHydrants)

    return () => {
      eventEmitter.removeListener('you_button_clicked', toggleUserLocation)
      eventEmitter.removeListener('toggle_pin', togglePins)
      eventEmitter.removeListener('toggle_roadblock', toggleRoadblocks)
      eventEmitter.removeListener('toggle_fireHydrant', toggleFireHydrants)
    }
  }, [])

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
        dispatch(
          updateIncident({
            ...incident,
            address: address,
          }),
        )
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
      incident.address !== ''
    ) {
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
            }
          })
          .catch((error) => {
            console.error('Error geocoding address:', error)
          })
      }
    }
  }, [incident.address])

  // -------------------------------- reach 911 features end --------------------------------

  // -------------------------------- wildfire features start --------------------------------

  const draw = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      polygon: true,
      trash: true,
    },
    defaultMode: 'simple_select',
    styles: [
      // line stroke
      {
        id: 'gl-draw-line',
        type: 'line',
        filter: ['all', ['==', '$type', 'LineString']],
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#D20C0C',
          'line-dasharray': [0.2, 2],
          'line-width': 2,
        },
      },
      // polygon fill
      {
        id: 'gl-draw-polygon-fill',
        type: 'fill',
        filter: ['all', ['==', '$type', 'Polygon']],
        paint: {
          'fill-color': 'transparent',
          'fill-outline-color': '#D20C0C',
          'fill-opacity': 0,
        },
      },
      // polygon mid points
      {
        id: 'gl-draw-polygon-midpoint',
        type: 'circle',
        filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
        paint: {
          'circle-radius': 3,
          'circle-color': '#fbb03b',
        },
      },
      // polygon outline stroke
      // This doesn't style the first edge of the polygon, which uses the line stroke styling instead
      {
        id: 'gl-draw-polygon-stroke-active',
        type: 'line',
        filter: ['all', ['==', '$type', 'Polygon']],
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#D20C0C',
          'line-dasharray': [0.2, 2],
          'line-width': 2,
        },
      },
      // vertex point halos
      {
        id: 'gl-draw-polygon-and-line-vertex-halo-active',
        type: 'circle',
        filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
        paint: {
          'circle-radius': 5,
          'circle-color': '#FFF',
        },
      },
      // vertex points
      {
        id: 'gl-draw-polygon-and-line-vertex-active',
        type: 'circle',
        filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
        paint: {
          'circle-radius': 3,
          'circle-color': '#D20C0C',
        },
      },
    ],
  })

  const createArea = (
    e: mapboxgl.MapMouseEvent & { features: mapboxgl.GeoJSONFeature[] },
  ) => {
    const data = draw.getAll()
    if (data.features.length > 0 && mapRef.current) {
      const areaId: string = e.features[0]?.id?.toString() || ''
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
      const areaName: string = generateDefaultName()

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
      createPopup({ areaId, coordinates: coordinates[0], name: areaName })
    }
  }

  const createPopup = (wildfireArea: WildfireArea) => {
    const areaId = wildfireArea.areaId
    const coordinates = wildfireArea.coordinates
    const areaName = wildfireArea.name

    if (popupRef.current.has(areaId)) {
      const nameDisplay = document.getElementById(`area-name-display-${areaId}`)
      if (nameDisplay) {
        nameDisplay.innerText = areaName || ''
      }
    }

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
          request('/api/wildfire/areas', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...wildfireArea, name: newName }),
          })
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
    const data = draw.getAll()
    // TODO: delete the area from the database
    // delete the popup as well
    const areaId: string = e.features[0]?.id?.toString() || ''
    if (areaId == '') return

    request(`/api/wildfire/areas?areaId=${areaId}`, {
      method: 'DELETE',
    })
      .then((response) => {
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
    // TODO: update name of the area
  }

  const addDrawControls = () => {
    if (!mapRef.current) return

    mapRef.current.addControl(draw)

    mapRef.current.on('draw.create', createArea)
    mapRef.current.on('draw.delete', deleteArea)
    mapRef.current.on('draw.update', updateArea)
    displayAllArea()
  }

  const removeDrawControls = () => {
    if (!mapRef.current) return

    mapRef.current.removeControl(draw)

    mapRef.current.off('draw.create', createArea)
    mapRef.current.off('draw.delete', deleteArea)
    mapRef.current.off('draw.update', updateArea)
    // remove all names
    deleteAllPopups()
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

    createPopup(wildfireArea)
  }

  const removeArea = () => {
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
    draw.delete(areaId)
    deletePopup(areaId)
  }

  const generateDefaultName = () => {
    const newAreaNum = areaNum + 1
    setAreaNum(newAreaNum)
    return `Area ${newAreaNum}`
  }

  // Function to update an air quality marker when new data is received
  const updateAirQualityMarker = (
    locationId: string,
    newAqi: number,
    timestamp: number,
  ) => {
    // Find the marker in our reference
    const marker = airQualityRef.current.get(locationId)
    if (!marker) {
      console.log(`No air quality marker found for locationId: ${locationId}`)
      return
    }

    // Create new AQI data object
    const aqiLevel = aqiToLevel(newAqi)
    const aqiColor = aqiLevelToColor(aqiLevel)
    const aqiData = {
      value: newAqi,
      level: aqiLevel,
      color: aqiColor,
      timeStamp: timestamp,
    }

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

      popupContent.innerHTML = `
        <div style="min-width: 200px;">
          <div style="background-color: #f0f0f0; padding: 8px; margin-bottom: 8px;">
            <p style="margin: 0;">US EPA PM2.5 AQI is now ${newAqi}</p>
            <p style="margin: 0; font-size: 0.8em;">Updated: ${new Date(timestamp * 1000).toLocaleString()}</p>
          </div>
          <div style="background-color: ${aqiColor}; color: white; padding: 8px; margin-bottom: 8px;">
            <p style="margin: 0 0 5px 0;">Air quality is ${aqiLevel}</p>
            <p style="margin: 0 0 5px 0;">Measurement quality is high</p>
            <p style="margin: 0 0 5px 0;">Evolution over the last 24 hours:</p>
            <div id="trending-icon-${locationId}" style="cursor: pointer;">
              ${ReactDOMServer.renderToString(<TrendingUpIcon style={{ color: 'white' }} />)}
            </div>
          </div>
          ${addressText ? `<p id="popup-address-${locationId}">${addressText}</p>` : ''}
          <div style="display: flex; justify-content: space-between;">
            <button id="edit-pin-${locationId}" style="padding:5px 10px; margin-top:5px; cursor:pointer; background-color: blue; color: white;">Edit</button>
            <button id="delete-pin-${locationId}" style="padding:5px 10px; margin-top:5px; cursor:pointer; background-color: red; color: white;">Delete</button>
            <button id="navigate-pin-${locationId}" style="padding:5px 10px; margin-top:5px; cursor:pointer; background-color: green; color: white;">Navigate</button>
          </div>
        </div>
      `

      // Replace popup content
      popup.setDOMContent(popupContent)

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
            navigateToMarker(
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
    const socket = SocketClient
    socket.connect()
    socket.on('map-area-update', (wildfireArea) => {
      console.log('socket 1: ', wildfireArea)
      drawArea(wildfireArea)
    })
    socket.on('map-area-delete', (areaId) => {
      console.log('socket 2: ', areaId)
      removeAreaById(areaId)
    })
    // Add air quality update listener
    socket.on('airQualityUpdate', (data) => {
      updateAirQualityMarker(data.locationId, data.air_quality, data.timestamp)
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
          overflow: 'hidden',
        }}
      >
        <Alert
          severity="warning"
          sx={{ mb: 2, width: '100%', boxSizing: 'border-box' }}
        >
          {mapError}
        </Alert>
        <LocationOnIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
        <Typography variant="body1" align="center">
          Please enter your address in the field above.
        </Typography>
      </Box>
    )
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
export const getMapboxToken = () => {
  if (!mapboxgl.accessToken) {
    mapboxgl.accessToken =
      'pk.eyJ1IjoiZG9tb25jYXNzaXUiLCJhIjoiY2x1cW9qb3djMDBkNjJoa2NoMG1hbGsyNyJ9.nqTwoyg7Xf4v__5IwYzNDA'
  }
  return mapboxgl.accessToken
}
