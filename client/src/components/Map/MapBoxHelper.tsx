import MapboxDraw from "@mapbox/mapbox-gl-draw";
import BlockIcon from "@mui/icons-material/Block";
import CloudIcon from "@mui/icons-material/Cloud";
import FireHydrantAltIcon from "@mui/icons-material/FireHydrantAlt";
import PushPinIcon from "@mui/icons-material/PushPin";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import mapboxgl from "mapbox-gl";
import React from "react";
import ReactDOMServer from "react-dom/server";
import Globals from "../../utils/Globals";
import { WildfireArea } from "../../utils/types";
import AQIData from "./AQIData";
import MapboxPopup from "./MapboxPopup";

export default class MapBoxHelper {
  private static mapboxDraw: MapboxDraw | null = null;

  static spawnMapboxPopup(
    element: React.ReactNode,
    marker: mapboxgl.Marker,
  ): React.ReactElement {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const dummy = <MapboxPopup child={element} marker={marker} />;

    marker.togglePopup();
    return dummy;
  }

  /**
   * Navigate to a specific marker
   * @param map - The map instance
   * @param lng - The longitude of the marker
   * @param lat - The latitude of the marker
   * @param stopLoading - The function to stop the loading
   */
  static async navigateToMarker(
    map: mapboxgl.Map | null,
    lng: number,
    lat: number,
    stopLoading: () => void
  ): Promise<string[] | null> {
    if (!map) {
      console.error("Map instance is not available.");
      stopLoading();
      return null;
    }
  
    console.log("Loading started");
  
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLng = position.coords.longitude;
          const userLat = position.coords.latitude;
  
          const accessToken = Globals.getMapboxToken();
  
          const routeUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLng},${userLat};${lng},${lat}?alternatives=true&geometries=geojson&language=en&overview=full&steps=true&access_token=${accessToken}`;
  
          try {
            const query = await fetch(routeUrl, { method: "GET" });
            const json = await query.json();
            const data = json.routes[0];
            const route = data.geometry;
            const steps = data.legs?.[0]?.steps ?? [];
  
            if (map.getSource("route")) {
              map.removeLayer("route");
              map.removeSource("route");
            }
  
            map.addSource("route", {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: route,
              },
            });
  
            map.addLayer({
              id: "route",
              type: "line",
              source: "route",
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": "#007aff",
                "line-width": 4,
              },
            });
  
            const bounds = new mapboxgl.LngLatBounds();
            route.coordinates.forEach((coord: [number, number]) =>
              bounds.extend(coord),
            );
  
            map.fitBounds(bounds, { padding: 50 });
  
            const instructions = steps.map(
              (step: any) => step.maneuver.instruction,
            );
  
            resolve(instructions);
          } catch (error) {
            console.error("Error fetching directions:", error);
            resolve(null);
          } finally {
            console.log("Loading stopped");
            stopLoading();
          }
        },
        (error) => {
          console.error("Error getting user location:", error);
          stopLoading();
          resolve(null);
        },
      );
    });
  }
  

  static async fetchAQIData(lng: number, lat: number): Promise<AQIData> {
    try {
      // Get AQI data from the backend
      const response = await fetch(
        `${Globals.backendUrl()}/api/airQuality?latitude=${lat}&longitude=${lng}`,
      );
      const data = await response.json();
      const { air_quality } = data;

      const response1 = await fetch(
        `${Globals.backendUrl()}/api/airQuality/MeasurementQuality?latitude=${lat}&longitude=${lng}`,
      );
      const data1 = await response1.json();
      const { measurement_quality } = data1;

      // Determine AQI level and color based on value
      const aqiLevel = this.aqiToLevel(air_quality);
      const aqiColor = this.aqiLevelToColor(aqiLevel);
      return {
        value: air_quality,
        level: aqiLevel,
        color: aqiColor,
        measurementQuality: measurement_quality,
        timeStamp: data.timeStamp,
      };
    } catch (error) {
      console.error("Error fetching AQI data:", error);
      return { value: null, level: "Unknown", color: "#000000" }; // Black for no data
    }
  }

  // Funtion to Convert US EPA AQI to AQI level
  // Unknown when no data is available; Good (<50); Moderate (50-100); Poor (101-300); Hazardous (>300)
  static aqiToLevel(
    aqi: number | string,
  ): "Unknown" | "Good" | "Moderate" | "Poor" | "Hazardous" {
    if (typeof aqi === "number") {
      if (aqi < 50) return "Good";
      if (aqi <= 100) return "Moderate";
      if (aqi <= 300) return "Poor";
      return "Hazardous";
    } else {
      return "Unknown";
    }
  }

  // Function to convert AQI level to color
  // Black for Unknown air quality; Green for Good (<50); Orange for Moderate (50-100); Red for Poor (101-300); Dark Purple for Hazardous (>300)
  static aqiLevelToColor(
    level: "Unknown" | "Good" | "Moderate" | "Poor" | "Hazardous",
  ): string {
    switch (level) {
      case "Good":
        return "#00e400"; // Green
      case "Moderate":
        return "#ff7e00"; // Orange
      case "Poor":
        return "#ff0000"; // Red
      case "Hazardous":
        return "#8f3f97"; // Dark purple
      default:
        return "#000000"; // Black
    }
  }

  /**
   * Store AQI data in the backend
   * @param locationId - The location ID of the marker
   * @param lngLat - The longitude and latitude of the marker
   * @param aqiData - The AQI data to store
   */
  static async storeAQIData(
    locationId: string,
    lngLat: mapboxgl.LngLat,
    aqiData: AQIData,
  ) {
    await fetch(`${Globals.backendUrl()}/api/airQuality`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locationId: locationId,
        latitude: lngLat.lat,
        longitude: lngLat.lng,
        air_quality: aqiData.value,
        timeStamp: aqiData?.timeStamp ?? Date.now(),
      }),
    });
  }

  static async deleteAQIData(locationId: string) {
    await fetch(`${Globals.backendUrl()}/api/airQuality/`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locationId: locationId }),
    });
  }

  /**
   * Spawn a popup for the AQI data of a specific location
   * @param aqiData - The AQI data to display
   * @param locationId - The location ID of the marker
   * @param addressText - The address of the marker
   * @param timestamp - The timestamp of the AQI data
   * @returns The popup content
   */
  static spawnAqiPopup(
    aqiData: AQIData,
    locationId: string,
    addressText: string,
    timestamp: number,
  ): HTMLDivElement {
    const popupContent = document.createElement("div");

    popupContent.innerHTML = `
        <div style="min-width: 200px;">
          <div style="background-color: #f0f0f0; padding: 8px; margin-bottom: 8px;">
            <p style="margin: 0;">US EPA PM2.5 AQI is now ${aqiData.value}</p>
            <p style="margin: 0; font-size: 0.8em;">Updated: ${new Date(timestamp * 1000).toLocaleString()}</p>
          </div>
          <div style="background-color: ${aqiData.color}; color: white; padding: 8px; margin-bottom: 8px;">
            <p style="margin: 0 0 5px 0;">Air quality is ${aqiData.level}</p>
            <p style="margin: 0 0 5px 0;">Measurement quality is ${aqiData?.measurementQuality ?? "no data"}</p>
            <p style="margin: 0 0 5px 0;">Evolution over the last 24 hours:</p>
            <div id="trending-icon-${locationId}" style="cursor: pointer;">
              ${ReactDOMServer.renderToString(<TrendingUpIcon style={{ color: "white" }} />)}
            </div>
          </div>
          ${addressText ? `<p id="popup-address-${locationId}">${addressText}</p>` : ""}
          <div style="display: flex; justify-content: space-between;">
            <button id="edit-pin-${locationId}" style="padding:5px 10px; margin-top:5px; cursor:pointer; background-color: blue; color: white;">Edit</button>
            <button id="delete-pin-${locationId}" style="padding:5px 10px; margin-top:5px; cursor:pointer; background-color: red; color: white;">Delete</button>
            <button id="navigate-pin-${locationId}" style="padding:5px 10px; margin-top:5px; cursor:pointer; background-color: green; color: white;">Navigate</button>
          </div>
        </div>
      `;

    return popupContent;
  }

  /**
   * Get the measurement quality of the AQI data of a specific location
   * @param lng - The longitude of the marker
   * @param lat - The latitude of the marker
   * @returns The measurement quality of the AQI data
   */
  static async getMeasurementQuality(
    lng: number,
    lat: number,
  ): Promise<string> {
    const response = await fetch(
      `${Globals.backendUrl()}/api/airQuality/MeasurementQuality?latitude=${lat}&longitude=${lng}`,
    );
    const data = await response.json();

    if (Object.keys(data).includes("measurement_quality")) {
      return data.measurement_quality;
    } else {
      throw new Error("No measurement quality data found");
    }
  }

  /**
   * Update the name of a wildfire area
   * @param wildfireArea - The wildfire area to update
   * @param name - The new name of the wildfire area
   */
  static async updateWildfireArea(wildfireArea: WildfireArea, name: string) {
    await fetch(`${Globals.backendUrl()}/api/wildfire/areas`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...wildfireArea, name }),
    });
  }

  static getMapboxDraw() {
    if (this.mapboxDraw) {
      return this.mapboxDraw;
    }

    this.mapboxDraw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      defaultMode: "simple_select",
      styles: [
        // line stroke
        {
          id: "gl-draw-line",
          type: "line",
          filter: ["all", ["==", "$type", "LineString"]],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#D20C0C",
            "line-dasharray": [0.2, 2],
            "line-width": 2,
          },
        },
        // polygon fill
        {
          id: "gl-draw-polygon-fill",
          type: "fill",
          filter: ["all", ["==", "$type", "Polygon"]],
          paint: {
            "fill-color": "transparent",
            "fill-outline-color": "#D20C0C",
            "fill-opacity": 0,
          },
        },
        // polygon mid points
        {
          id: "gl-draw-polygon-midpoint",
          type: "circle",
          filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
          paint: {
            "circle-radius": 3,
            "circle-color": "#fbb03b",
          },
        },
        // polygon outline stroke
        // This doesn't style the first edge of the polygon, which uses the line stroke styling instead
        {
          id: "gl-draw-polygon-stroke-active",
          type: "line",
          filter: ["all", ["==", "$type", "Polygon"]],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#D20C0C",
            "line-dasharray": [0.2, 2],
            "line-width": 2,
          },
        },
        // vertex point halos
        {
          id: "gl-draw-polygon-and-line-vertex-halo-active",
          type: "circle",
          filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
          paint: {
            "circle-radius": 5,
            "circle-color": "#FFF",
          },
        },
        // vertex points
        {
          id: "gl-draw-polygon-and-line-vertex-active",
          type: "circle",
          filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
          paint: {
            "circle-radius": 3,
            "circle-color": "#D20C0C",
          },
        },
      ],
    });

    return this.mapboxDraw;
  }

  static async deleteWildfireArea(areaId: string) {
    await fetch(`${Globals.backendUrl()}/api/wildfire/areas?areaId=${areaId}`, {
      method: "DELETE",
    });
  }

  static getMarkerIcon(type: string, aqiData?: AQIData) {
    let iconComponent;

    switch (type) {
      case "pin":
        iconComponent = (
          <PushPinIcon
            style={{
              color: "rgb(25, 118, 210)",
              fontSize: "32px",
              opacity: "80%",
            }}
          />
        );
        break;
      case "roadblock":
        iconComponent = (
          <BlockIcon
            style={{
              color: "rgb(25, 118, 210)",
              fontSize: "32px",
              opacity: "80%",
            }}
          />
        );
        break;
      case "fireHydrant":
        iconComponent = (
          <FireHydrantAltIcon
            style={{
              color: "rgb(25, 118, 210)",
              fontSize: "32px",
              opacity: "80%",
            }}
          />
        );
        break;
      case "airQuality":
        iconComponent = (
          <div style={{ position: "relative" }}>
            <CloudIcon
              style={{
                color: aqiData ? aqiData.color : "#000000", // Default to black for no data
                fontSize: "32px",
                opacity: "80%",
              }}
            />
            {aqiData && aqiData.value !== null && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color: "#ffffff",
                  textShadow: "0px 0px 2px rgba(0,0,0,0.8)",
                }}
              >
                {aqiData.value}
              </div>
            )}
          </div>
        );
        break;
      default:
        iconComponent = (
          <PushPinIcon
            style={{ color: "gray", fontSize: "32px", opacity: "80%" }}
          />
        );
    }

    return iconComponent;
  }
}
