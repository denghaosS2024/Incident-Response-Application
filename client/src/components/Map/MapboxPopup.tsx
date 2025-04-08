import mapboxgl from "mapbox-gl";
import React, { useEffect } from "react";

/**
 * MapboxPopup component
 * @param {Object} props - The component props
 * @param {React.ReactNode} props.child - The child element to display in the popup
 * @param {mapboxgl.Marker} props.marker - The mapbox marker to attach the popup to
 * @param {Record<string, () => void} props.events - The events to attach to the popup
 * @returns {React.ReactNode} The MapboxPopup component
 */
export default function MapboxPopup({
  child,
  marker,
  events,
}: {
  child: React.ReactNode;
  marker: mapboxgl.Marker;
  events?: Record<string, () => void>;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
      }).setDOMContent(ref.current);
      marker.setPopup(popup);

      if (events) {
        Object.entries(events).forEach(([event, handler]) => {
          popup.on(event, handler);
        });
      }
    }
  }, []);
  return <div ref={ref}>{child}</div>;
}
