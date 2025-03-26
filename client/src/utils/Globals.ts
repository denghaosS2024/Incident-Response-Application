/*
 * This class contains all the global variables for the application
 * Delegates the read of ENV and fallbacks
 */
export default class Globals {
  public static backendUrl() {
    if (!import.meta.env.VITE_BACKEND_URL) {
      console.warn(
        'VITE_BACKEND_URL is not set. Using localhost:3001 as fallback.',
      )
    }

    return import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3001'
  }
  public static getMapboxToken() {
    if (!import.meta.env.VITE_MAPBOX_TOKEN) {
      console.warn('VITE_MAPBOX_TOKEN is not set. Using fallback token.')
    }
    return (
      import.meta.env.VITE_MAPBOX_TOKEN ??
      'pk.eyJ1IjoiZG9tb25jYXNzaXUiLCJhIjoiY204Mnlqc3ZzMWxuNjJrcTNtMTFjOTUyZiJ9.isQSr9JMLSztiJol_nQSDA'
    )
  }
}
