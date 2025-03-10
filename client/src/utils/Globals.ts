/*
 * This class contains all the global variables for the application
 * Delegates the read of ENV and fallbacks
 */
export default class Globals {
  public static backendUrl() {
    if (!process.env.REACT_APP_BACKEND_URL) {
      console.warn(
        'REACT_APP_BACKEND_URL is not set. Using localhost:3001 as fallback.',
      )
    }

    return process.env.REACT_APP_BACKEND_URL ?? 'http://localhost:3001'
  }
}
