import React from 'react';
import MapLayer from '../components/Map/MapLayer';

const MapPage: React.FC = () => {
  return (
    <div style={{ 
      height: '100%',
      width: '100%',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <MapLayer />
    </div>
  );
};

export default MapPage;
