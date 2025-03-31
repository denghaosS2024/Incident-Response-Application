import { Box, Typography } from '@mui/material'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import React, { useEffect, useRef, useState } from 'react'
import type IIncident from '../../models/Incident'
import StepIndicator from '../common/StepIndicator'

const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN
mapboxgl.accessToken = mapboxToken

interface Step1EmergencyDetailsProps {
    incidentData: IIncident
}

const Step1EmergencyDetails: React.FC<Step1EmergencyDetailsProps> = ({
    incidentData,
}) => {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<mapboxgl.Map | null>(null)
    const [coordinates, setCoordinates] = useState<[number, number] | null>(
        null,
    )

    useEffect(() => {
        const fetchCoordinates = async () => {
            if (!incidentData.address) return

            try {
                // 使用Mapbox Geocoding API获取坐标
                const response = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(incidentData.address)}.json?access_token=${mapboxToken}`,
                )

                const data = await response.json()

                if (data.features && data.features.length > 0) {
                    const [lng, lat] = data.features[0].center
                    setCoordinates([lng, lat])
                }
            } catch (error) {
                console.error('Error fetching coordinates:', error)
            }
        }

        fetchCoordinates()
    }, [incidentData.address])

    useEffect(() => {
        if (!coordinates || !mapContainer.current) return

        if (map.current) {
            map.current.remove()
        }

        const newMap = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: coordinates,
            zoom: 14,
        })

        newMap.addControl(new mapboxgl.NavigationControl(), 'top-right')

        new mapboxgl.Marker().setLngLat(coordinates).addTo(newMap)

        map.current = newMap

        return () => {
            if (map.current) {
                map.current.remove()
            }
        }
    }, [coordinates])

    return (
        <Box sx={{ mt: 3, mb: 4 }}>
            <StepIndicator currentStep={1} totalSteps={5} />

            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                Emergency address (latest):
            </Typography>

            <Box
                sx={{
                    border: '2px solid #000',
                    p: 1,
                    mb: 2,
                    width: '100%',
                    maxWidth: 400,
                    borderRadius: '2px',
                }}
            >
                <Typography variant="body1">
                    {incidentData.address || 'No address provided'}
                </Typography>
            </Box>

            <Box
                ref={mapContainer}
                sx={{
                    width: '100%',
                    maxWidth: 400,
                    height: 200,
                    border: '1px solid #e0e0e0',
                }}
            />

            {!coordinates && incidentData.address && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                >
                    Loading map...
                </Typography>
            )}

            {!incidentData.address && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    No address available to display on map
                </Typography>
            )}
        </Box>
    )
}

export default Step1EmergencyDetails
