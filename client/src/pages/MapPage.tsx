import React from 'react';
import MapLayer from '../components/Map/MapLayer';
import Map from '../components/Map/Mapbox';



const MapPage: React.FC = () => {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        position: 'relative',
        margin: 0,
        padding: 0,
      }}
    >
      <MapLayer />
      <Map showMarker={false} disableGeolocation={false}/>
    </div>
  );
};

export default MapPage;
