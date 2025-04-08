import IHospital from "@/models/Hospital";
import Globals from "../../../utils/Globals";
import { Location } from "@/utils/types";
// Access token
const accessToken = Globals.getMapboxToken();

export const fetcHospitalCoordinates = async (
  hospital: IHospital,
): Promise<number[]> => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${hospital.hospitalAddress}.json?access_token=${accessToken}`,
    );
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const coordinate: number[] = data.features[0].geometry.coordinates;

      return coordinate;
    } else {
      throw Error(
        "Something Wrong with the return data from fetch hospital coords",
      );
    }
  } catch (err) {
    console.error(err);
  }

  return [] as number[];
};

export const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    // setError('Geolocation is not supported by your browser.')
    console.error("Geolocation is not supported by your browser.");
  }
  const currentLocation: Location = {
    latitude: 0,
    longitude: 0,
  };
  navigator.geolocation.getCurrentPosition(
    (position) => {
      currentLocation.latitude = position.coords.latitude;
      currentLocation.longitude = position.coords.longitude;
    },
    (error) => {
      console.error(error);
    },
  );

  return currentLocation;
};

export const calculateDistance = async (
  coord: number[],
  location: Location,
) => {
  if (!location) {
    return NaN;
  }
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${[coord[0], coord[1]]};${location?.longitude},${location?.latitude}.json?access_token=${accessToken}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw Error("API fetch has error");
    }
    const data = await response.json();
    if (data.routes && data.routes.length > 0) {
      const dist = Math.round(data.routes[0].distance);

      return dist;
    }
  } catch (err) {
    console.error(err);
  }
};
