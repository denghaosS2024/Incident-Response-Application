import IHospital from '@/models/Hospital'
import Globals from '@/utils/Globals'
import { Box, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { Droppable } from 'react-beautiful-dnd'

interface HospitalProps {
  hospital: IHospital
  id: string
}

const HospitalCard: React.FC<HospitalProps> = ({ hospital, id }) => {
  const availableBeds =
    hospital.totalNumberERBeds - hospital.totalNumberOfPatients || 0

  // Access token
  const accessToken = Globals.getMapboxToken()
  const [location, setLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)
  const [hospitalCoordinates, setHospitalCoordinates] = useState<number[]>([])
  const [distance, setDistance] = useState<number>(0)

  useEffect(() => {
    const hospitalcoords = async () => {
      if (!navigator.geolocation) {
        // setError('Geolocation is not supported by your browser.')
        return
      }
      const currentLocation = {
        latitude: 0,
        longitude: 0,
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          currentLocation.latitude = position.coords.latitude
          currentLocation.longitude = position.coords.longitude
        },
        (error) => {
          console.error(error)
        },
      )
      const coord = await fetcHospitalCoordinates()
      await calculateDistance(coord, currentLocation)
    }

    hospitalcoords()
  }, [])

  const fetcHospitalCoordinates = async (): Promise<number[]> => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${hospital.hospitalAddress}.json?access_token=${accessToken}`,
      )
      const data = await response.json()
      console.log('The data from externel API in fetch coord: ' + data)
      if (data.features && data.features.length > 0) {
        const coordinate: number[] = data.features[0].geometry.coordinates

        setHospitalCoordinates(coordinate)

        return coordinate as number[]
      } else {
        throw Error(
          'Something Wrong with the return data from fetch hospital coords',
        )
      }
    } catch (err) {
      console.error(err)
    }

    return [] as number[]
  }

  const calculateDistance = async (coord: number[], location: any) => {
    console.log('in distance: ' + coord)
    // Reverse geocode to get address
    // console.log("lo " + location)
    console.log(coord)
    console.log(location)
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${[coord[0], coord[1]]};${location?.longitude},${location?.latitude}.json?access_token=${accessToken}`
    console.log('url: ', url)

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw Error('API fetch has error')
      }
      const data = await response.json()
      console.log(data)
      if (data.routes && data.routes.length > 0) {
        const dist = data.routes[0].distance
        console.log('dist ' + dist)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // // Use `useEffect` to watch for state updates
  // useEffect(() => {
  //   //console.log('Updated hospitalCoordinates:', hospitalCoordinates)

  // }, [hospitalCoordinates])

  return (
    <Droppable droppableId={id}>
      {(provided, snapshot) => (
        <Box className="border border-gray-300 rounded-lg p-3 mb-2">
          <Box className="flex flex-row justify-between">
            <Typography className="font-extrabold" fontWeight="bold">
              {hospital.hospitalName}
            </Typography>
            <Typography className="text-gray-500">
              {availableBeds} - ({hospital.totalNumberERBeds || 0}) Beds
            </Typography>
          </Box>

          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="border-t border-gray-300 pt-3 mt-3"
          >
            {provided.placeholder}
          </Box>
        </Box>
      )}
    </Droppable>
  )
}

export default HospitalCard
