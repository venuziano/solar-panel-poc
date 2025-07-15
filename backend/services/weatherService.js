const { HttpError } = require("../helpers/errorHandler");

/**
 * Get weather forecast for a specific location
 * @param {string} location - The location to get weather for
 * @returns {Promise<Object>} - Weather forecast data
 */
const getWeatherForecast = async (location) => {
  
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    location,
    forecast: 'sunny', // Candidate will need to implement more realistic forecasts
    temperature: 75,
    humidity: 45
  };
};

const ALLOWED_UNITS = ['standard', 'metric', 'imperial']

/**
 * Service for the OpenWeatherMap API.
 */
class OpenWeatherService {

  /**
   * @param {string} apiKey OpenWeatherMap API key
   * @param {string} [openWeatherBaseURL] Base URL for the API
   * @param {string} [defaultUnits] Default units ('standard'|'metric'|'imperial')
   */
  constructor({
    apiKey = process.env.WEATHER_API_KEY,
    openWeatherBaseURL = 'https://api.openweathermap.org/data/2.5',
    defaultUnits = 'metric'
  } ={}) {
    if (!apiKey) throw new Error('Open Weather API key required');
    if (!ALLOWED_UNITS.includes(defaultUnits)) {
      throw new Error(
        `Invalid unit "${defaultUnits}". Allowed units: ${ALLOWED_UNITS.join(', ')}`
      );
    }

    this.apiKey = apiKey;
    this.openWeatherBaseURL = openWeatherBaseURL;
    this.defaultUnits = defaultUnits;
  }

  /**
   * Fetch current weather for a location.
   *
   * @param {string} address Location query (e.g. "San Diego")
   * @param {string} [units] Units override ('standard'|'metric'|'imperial')
   * @returns {Promise<Object>} The JSON response from OpenWeatherMap
   */
  async getWeatherByAddress(address, units) {
    if (typeof address !== 'string' || !(address = address.trim())) {
      throw new Error('address is required and must be non-empty');
    }

    const params = new URLSearchParams({
      q: address,
      appid: this.apiKey,
      units: units || this.defaultUnits
    })

    const url = `${this.openWeatherBaseURL}/weather?${params}`

    const response = await fetch(url)

    if (response.status === 429) {
      throw new HttpError(429, 'OpenWeather rate limit exceeded');
    }

    if (!response.ok) {
      let errorMessage = response.statusText

      try {
        const errorInfo = await response.json()
        if (errorInfo?.message) errorMessage = errorInfo.message
      } catch {}

      throw new HttpError(
        response.status,
        `OpenWeather integration error: ${errorMessage}`
      );
    }

    const data = await response.json();
    
    if (!data.main || typeof data.main.temp !== 'number') {
      throw new HttpError(502, 'OpenWeather returned malformed data');
    }

    return data;
  }

  /**
   * Defines the weather category based in the weather ID response from the OpenWeather API.
   * Categorize it into one of the detailed weather groups:
   *   - 'thunderstorm' (2xx)
   *   - 'drizzle'      (3xx)
   *   - 'rain'         (5xx)
   *   - 'snow'         (6xx)
   *   - 'atmosphere'   (7xx)
   *   - 'clear'        (800)
   *   - 'clouds'       (801–804)
   *   - 'unknown'      (anything else or malformed)
   *
   * @param {Number} weatherCode
   * @returns {'thunderstorm'|'drizzle'|'rain'|'snow'|'atmosphere'|'clear'|'clouds'|'unknown'}
   */
  categorizeWeatherByCode(weatherCode) {
    if (typeof weatherCode !== 'number' || Number.isNaN(weatherCode)) {
      return 'unknown';
    }

    const group = Math.floor(weatherCode / 100);

    switch (group) {
      case 2:
        return 'Thunderstorm';
      case 3:
        return 'Drizzle';
      case 5:
        return 'Rain';
      case 6:
        return 'Snow';
      case 7:
        return 'Atmosphere';
      case 8:
        // special case: 800 is “clear”, 801–804 are clouds
        return weatherCode === 800 ? 'Clear' : 'Clouds';
      default:
        return 'unknown';
    }
  }
}

module.exports = OpenWeatherService
