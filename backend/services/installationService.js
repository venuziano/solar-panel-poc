const crypto = require('crypto');

const { HttpError } = require("../helpers/errorHandler");
const { installations, INSTALLATION_STATUS } = require("../seeds/installations");

/**
 * Defines the service for the Installation entity.
 */
class InstallationService {
  constructor({ openWeatherService } = {}) {
    if (!openWeatherService) {
      throw new Error('InstallationService requires a weatherService');
    }
    this.weatherService = openWeatherService;
  }

  /**
   * Defines the service to get all installations.
   *
   * @param {string} status Defines the status (Enum: INSTALLATION_STATUS) to filter.
   * @param {number} page Defines the page to filter. Example = 1
   * @param {limit} status Defines the pagination limit. Example = 10
   * @returns {Promise<Object>} Pagination Object({ items[], page, limit, totalItems })
   */
  async getInstallations(status, page = 1, limit = 10) {
    const filteredInstallations = status == null ? installations : installations.filter(installation => installation.status === status)
    
    // We should get the city name spliting in the ',' character.
    const cities = filteredInstallations.map(install => install.address);

    // We should only get unique cities.
    const uniqueCities = Array.from(new Set(cities));

    // Let's get the weather by city, avoiding pinging the service API for duplicated cities.
    const results = await Promise.all(
      uniqueCities.map(city => this.weatherService.getWeatherByAddress(city))
    );

    const weatherByCity = uniqueCities.reduce((acc, city, index) => {
      acc[city] = results[index];
      return acc;
    }, {});

    const finalInstallations = filteredInstallations.map(install => {
      // If using DTOs, we don't include the ID in the endpoint contract.
      delete install.id
      return {
        ...install,
        weatherForecast: this.weatherService.categorizeWeatherByCode(weatherByCity[install.address].weather[0].id)
      };
    });

    const sortedItems = finalInstallations.sort((a, b) => {
      const da = new Date(a.createdAt)
      const db = new Date(b.createdAt)
      return db - da
    })

    const totalItems = sortedItems.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const items = sortedItems.slice(start, end);
    
    return {
      items, page, limit, totalItems
    };
  }

  /**
   * Defines the service to create an installation.
   *
   * @param {Object} installmentCreateDTO Defines the parameter to create an installation (date, location, estimatedCostSavings).
   * @returns {Object} Created installment Object.
   */
  async create(installmentCreateDto) {
    const weatherDetails = await this.weatherService.getWeatherByAddress(installmentCreateDto.address)

    if (!weatherDetails) throw new HttpError(404, 'Weather not found')

    const averageSunHoursPerDay = this.calculateAverageSunHoursPerDay(
      weatherDetails.sys.sunset,
      weatherDetails.sys.sunrise
    )

    const newInstallation = {
      // Increment current last id + 1
      id: installations.map(installation => Number(installation.id) || 0).reduce((max, id) => Math.max(max, id), 0) + 1,
      uuid: crypto.randomUUID(),
      date: installmentCreateDto.date,
      address: installmentCreateDto.address,
      state: installmentCreateDto.state,
      location: installmentCreateDto.location,
      createdAt: new Date().toISOString(),
      estimatedCostSavings:
        Number(this.calculateEstimateSaveCosts({
          panelCapacity_kW: installmentCreateDto.panelCapacity_kW,
          efficiency: installmentCreateDto.efficiency,
          electricityRate: installmentCreateDto.electricityRate,
          averageSunHoursPerDay
        }).toFixed(2)),
      status: INSTALLATION_STATUS.SCHEDULED,
    };

    installations.push(newInstallation);

    return newInstallation
  }

  /**
   * Calculates the estimated annual cost savings based on solar panel production.
   *
   * @param {Object} calculateEstimateSaveCostsDto
   * @param {number} calculateEstimateSaveCostsDto.panelCapacity_kW - Solar panel capacity in kilowatts (kW).
   * @param {number} calculateEstimateSaveCostsDto.efficiency - System efficiency as a decimal (e.g., 0.75 for 75%).
   * @param {number} calculateEstimateSaveCostsDto.electricityRate - Electricity rate in currency units per kWh.
   * @param {number} calculateEstimateSaveCostsDto.averageSunHoursPerDay - Average sun hours per day.
   * @returns {number} Estimated annual cost savings in the same currency as the electricity rate.
   */
  calculateEstimateSaveCosts(calculateEstimateSaveCostsDto) {
    const { panelCapacity_kW, efficiency, electricityRate, averageSunHoursPerDay } = calculateEstimateSaveCostsDto
    const daysInYear = 365
    const annual_kWh = panelCapacity_kW * averageSunHoursPerDay * daysInYear * efficiency
    return annual_kWh * electricityRate
  }

  /**
  * Calculates the number of daylight hours between sunrise and sunset.
  *
  * @param {number} sunset - Unix timestamp (in seconds) of the day's sunset.
  * @param {number} sunrise - Unix timestamp (in seconds) of the day's sunrise.
  * @returns {number} The length of daylight in hours.
  */
  calculateAverageSunHoursPerDay(sunset, sunrise) {
    // NOTE: Depending on the weather API, we can calculate an average from daily sunrise/sunset history. For example:
    // "daily": [
    //   { "sunrise": 168xxx0000, "sunset": 168xxx9000, … },
    //   { "sunrise": 168xxx3600, "sunset": 168xxx9600, … },
    //   // etc.
    // ]
    // That feature is paid in OpenWeatherMap API
    return (sunset - sunrise) / 3600
  }
}

module.exports = { InstallationService }