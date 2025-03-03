import React from 'react';
import MapLayer from '../components/Map/MapLayerNew';

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
