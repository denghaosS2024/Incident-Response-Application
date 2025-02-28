import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapLoading from './MapLoading'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';


const Mapbox: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const [currentLat, setCurrentLat] = useState<number>(40);
  const [currentLng, setCurrentLng] = useState<number>(-74.5);

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZG9tb25jYXNzaXUiLCJhIjoiY2x1cW9qb3djMDBkNjJoa2NoMG1hbGsyNyJ9.nqTwoyg7Xf4v__5IwYzNDA';

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLat(latitude);
          setCurrentLng(longitude);
          // initilize map and set the center to the user's current location
          mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current!,
            style: 'mapbox://styles/domoncassiu/cm7og9k1l005z01rdd6l78pdf',
            center: [longitude, latitude],
            zoom: 1,
          });

            mapRef.current.on('load', () => {
                geolocateControl.trigger();
                setIsMapLoaded(true);
            });

          const geolocateControl = new mapboxgl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true,
          });
          mapRef.current.addControl(geolocateControl);
        },
        (error) => {
          console.error('Geolocation error:', error);
          // TODO: use prvious location if gps not found
          mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current!,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [-74.5, 40],
            zoom: 12,
          });
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
      // TODO: use prvious location if gps not found
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current!,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-74.5, 40],
        zoom: 12,
      });
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  return (
  <div>
    <div ref={mapContainerRef} style={{ width: '100vw', height: '100vh'  }} />;
    {!isMapLoaded && <MapLoading />}
  </div>
    );
};

export default Mapbox;
