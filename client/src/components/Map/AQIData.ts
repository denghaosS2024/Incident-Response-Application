export default interface AQIData {
  value: number | null;
  level: "Unknown" | "Good" | "Moderate" | "Poor" | "Hazardous";
  color: string;
  timeStamp?: number;
  measurementQuality?: string;
}
