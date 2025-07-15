const seedData = [
    {
      id: 1,
      date: '2025-05-15',
      location: 'San Francisco, CA',
      status: 'SCHEDULED',
      estimatedCostSavings: 12500
    },
    {
      id: 2,
      date: '2025-05-20',
      location: 'Los Angeles, CA',
      status: 'COMPLETED',
      estimatedCostSavings: 15000
    }
  ];

jest.mock('../../seeds/installations', () => ({
  installations: seedData,
  INSTALLATION_STATUS: { SCHEDULED: 'SCHEDULED', COMPLETED: 'COMPLETED' }
}));

const { HttpError } = require('../../helpers/errorHandler');
const { InstallationService } = require('../../services/installationService');
const { INSTALLATION_STATUS } = require('../../seeds/installations');

describe('InstallationService', () => {
  let service;
  let mockWeather;

  beforeEach(() => {
    installations = JSON.parse(JSON.stringify(seedData));
    mockWeather = {
      getWeatherByAddress: jest.fn(),
      categorizeWeatherByCode: jest.fn()
    };
    service = new InstallationService({ openWeatherService: mockWeather });
  });

  describe('.getInstallations()', () => {
    it('should throw if weatherService missing', () => {
      expect(() => new InstallationService()).toThrow('InstallationService requires a weatherService');
    });

    it('returns paginated & decorated items', async () => {
      // two installs, same city so only one weather call
      seedData[0].location = seedData[1].location = 'X, Y'
      mockWeather.getWeatherByAddress.mockResolvedValue({ weather:[{id:123}] });
      mockWeather.categorizeWeatherByCode.mockReturnValue('Rain');

      const { items, page, limit, totalItems } = await service.getInstallations(
        null, /* no status filter */ 1, 10
      );

      expect(mockWeather.getWeatherByAddress).toHaveBeenCalledTimes(1);
      expect(totalItems).toBe(2);
      expect(page).toBe(1);
      expect(limit).toBe(10);
      expect(items.every(i => i.weatherForecast === 'Rain')).toBe(true);
    });
  });

  describe('.create()', () => {
    it('throws 404 if no weather details', async () => {
      mockWeather.getWeatherByAddress.mockResolvedValue(null);
      await expect(
        service.create({ location:'Z', date:'2025-01-01', panelCapacity_kW:1, efficiency:1, electricityRate:1 })
      ).rejects.toBeInstanceOf(HttpError);
    });

    it('builds & returns new installation', async () => {
      mockWeather.getWeatherByAddress.mockResolvedValue({ sys:{sunrise:0, sunset:3600}, weather:[{id:800}] });
      mockWeather.categorizeWeatherByCode.mockReturnValue('Clear');
      
      jest.spyOn(service, 'calculateEstimateSaveCosts').mockReturnValue(5);

      const dto = { date:'D', location:'L', panelCapacity_kW:2, efficiency:0.8, electricityRate:0.25 };
      const created = await service.create(dto);

      expect(created).toMatchObject({
        date: dto.date,
        location: dto.location,
        status: INSTALLATION_STATUS.SCHEDULED,
        estimatedCostSavings: 5
      });
      
      expect(seedData.length).toBe( /* original length */ 2 + 1 )
    });
  });

  describe('helpers', () => {
    it('.calculateAverageSunHoursPerDay()', () => {
      expect(service.calculateAverageSunHoursPerDay(7200, 0)).toBe(2);
    });
    it('.calculateEstimateSaveCosts()', () => {
      const dto = {
        panelCapacity_kW: 1,
        efficiency: 1,
        electricityRate: 2, 
        averageSunHoursPerDay: 1
      };
      // annual_kWh = 1 * 1 * 365 * 1 = 365
      // expect 365 * 2 = 730
      expect(service.calculateEstimateSaveCosts(dto)).toBe(365 * 2);
    });
  });
});
