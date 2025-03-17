import Map from '../components/Map/Mapbox'
import MapOverlay from '../components/Map/MapOverlay'
export default function MapPage() {
  return (
    <div className="h-full w-full overflow-hidden">
      <MapOverlay />
      <Map showMarker={false} disableGeolocation={false} />
    </div>
  )
}
