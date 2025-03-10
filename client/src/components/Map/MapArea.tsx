// import React, { useEffect, useRef, useState } from 'react';
// import mapboxgl from 'mapbox-gl';
// import MapboxDraw from '@mapbox/mapbox-gl-draw';

// import 'mapbox-gl/dist/mapbox-gl.css';
// import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

// const paragraphStyle = {
//   fontFamily: 'Open Sans',
//   margin: 0,
//   fontSize: 13
// };




//

// temp code

// const draw = new MapboxDraw({
//     displayControlsDefault: false,
//     controls: {
//       polygon: true,
//       trash: true
//     },
//     defaultMode: 'draw_polygon'
//   });

//   const createArea = (e: mapboxgl.MapMouseEvent & { features: mapboxgl.GeoJSONFeature[] }) => {
//     const data = draw.getAll();
//     if (data.features.length > 0 && mapRef.current) {
//       const coordinates = data.features[0].geometry;
//       const areaId = uuidv4();
//       const areaName = null;

//       // Add properties to the feature
//       data.features[0].properties = {
//         areaId: areaId,
//         name: areaName
//       };

//       // mapRef.current.addLayer({
//       //   'id': 'polygon-label2',
//       //   'type': 'symbol',
//       //   'source': 'mapbox-gl-draw-cold',
//       //   'layout': {
//       //     'text-field': ['get', 'name'],
//       //     'text-size': 12,
//       //     'text-anchor': 'center'
//       //   },
//       //   'paint': {
//       //     'text-color': '#000000'
//       //   }
//       // });
//       console.log('Polygon coordinates:', coordinates);
//       console.log('Area ID:', areaId);
//       console.log('Area Name:', areaName);

//       // TODO: Make the name editable in the frontend
//     }
//   };

//   const deleteArea = (e: mapboxgl.MapMouseEvent & { features: mapboxgl.GeoJSONFeature[] }) => {
//     const data = draw.getAll();
//     // TODO: delete the area from the database


//   };

// const updateArea = (e: mapboxgl.MapMouseEvent & { features: mapboxgl.GeoJSONFeature[] }) => {
//     const data = draw.getAll();
//     // TODO: update name of the area

    
// };
  
//   mapRef.current.addControl(draw);

//   mapRef.current.on('draw.create', createArea);
//   mapRef.current.on('draw.delete', deleteArea);
//   mapRef.current.on('draw.update', updateArea);
//   mapRef.current.on('styledata', () => {
//     if (mapRef.current && mapRef.current.isStyleLoaded()) {
//       mapRef.current.addLayer({
//         'id': 'polygon-layer',
//         'type': 'fill',
//         'source': 'mapbox-gl-draw-hot',
//         'layout': {},
//         'paint': {
//           'fill-color': '#888888',
//           'fill-opacity': 0.4
//         }
//       });
//       mapRef.current.addLayer({
//         'id': 'polygon-label',
//         'type': 'symbol',
//         'source': 'mapbox-gl-draw-cold',
//         'layout': {
//           'text-field': ['get', 'name'],
//           'text-size': 12,
//           'text-anchor': 'center'
//         },
//         'paint': {
//           'text-color': '#000000'
//         }
//       });
//     }
//   });
  

const MapboxExample = 0;

export default MapboxExample;