import dotenv from 'dotenv'

/**
 * Class for setting up Env, retrieving parameters from the .env file, and setting keys dynamically
 */
export default class Env {
  private static _isEnvSet = false
  private static _env_data = {}

  /**
   * Ensure the .env file is loaded into memory before any other operations
   */
  public static ensureEnvSet() {
    if (!this._isEnvSet) {
      this._isEnvSet = true
      dotenv.config()

      this._env_data = process.env
    }
  }

  /**
   * Get a parameter from the .env file or dynamically set value
   * @param key - The key to get the value of
   * @param defaultValue - The default value to return if the key is not found
   * @param errorOnMissing - Whether to throw an error if the key is not found
   * @returns The value of the key
   */
  public static getParam(
    key: string,
    defaultValue: string | undefined = undefined,
    errorOnMissing: boolean = false,
  ) {
    this.ensureEnvSet()

    if (key === undefined || key === '' || key === null) {
      throw Error(`Invalid key passed: ${key}`)
    }

    const match_key = (key ?? '').toUpperCase()

    if (Object.keys(this._env_data).includes(match_key)) {
      return this._env_data[match_key]
    } else if (defaultValue !== undefined) {
      return defaultValue
    } else if (errorOnMissing) {
      throw Error(
        `Key is not present in .env file or not dynamically set: ${key}`,
      )
    }

    return undefined
  }

  /**
   * Set a key dynamically. DOES NOT PERSIST. It will not be written to the .env file.
   * @param key - The key to set the value of
   * @param value - The value to set the key to
   */
  public static setKey(key: string, value: string) {
    this.ensureEnvSet()

    this._env_data[key.toUpperCase()] = value
  }

  public static getFrontendCorsUrl() {
    return this.getParam('FRONTEND_URL', '*')
  }

  public static getBackendPort() {
    return this.getParam('PORT', '3001')
  }

  public static getApiUrl() {
    return this.getParam('API_URL', 'http://localhost:3001')
  }

  /**
   * Get the URL for the PurpleAir API
   * @returns The URL for the PurpleAir API
   */
  public static getPurpleAirUrl() {
    return (
      this.getParam(
        'PURPLEAIR_API_URL',
        'https://api.purpleair.com/v1/',
        false,
      ) + 'sensors/'
    )
  }

  /**
   * Get the key for the PurpleAir API
   * @returns The key for the PurpleAir API
   */
  public static getPurpleAirKey() {
    return this.getParam('PURPLEAIR_API_KEY_READ', undefined, false)
  }
}
