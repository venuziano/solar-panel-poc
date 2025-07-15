const OpenWeatherService = require('../../services/weatherService');

describe('OpenWeatherService', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV, WEATHER_API_KEY: 'test-key' };
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    delete global.fetch;
  });

  describe('constructor', () => {
    it('throws if no apiKey provided', () => {
      delete process.env.WEATHER_API_KEY;
      expect(() => new OpenWeatherService()).toThrow('Open Weather API key required');
    });

    it('throws if defaultUnits invalid', () => {
      expect(
        () => new OpenWeatherService({ apiKey: 'k', defaultUnits: 'foo' })
      ).toThrow('Invalid unit "foo". Allowed units: standard, metric, imperial');
    });

    it('sets properties correctly when valid', () => {
      const svc = new OpenWeatherService({
        apiKey: 'k',
        openWeatherBaseURL: 'https://api.test/',
        defaultUnits: 'imperial'
      });
      expect(svc.apiKey).toBe('k');
      expect(svc.openWeatherBaseURL).toBe('https://api.test/');
      expect(svc.defaultUnits).toBe('imperial');
    });
  });

  describe('getWeatherByAddress', () => {
    let svc;
    beforeEach(() => {
      svc = new OpenWeatherService({ apiKey: 'k', defaultUnits: 'metric' });
    });

    it('calls fetch with correct URL & returns JSON on success', async () => {
      const fakeData = { foo: 'bar' };
      global.fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(fakeData)
      });

      const res = await svc.getWeatherByAddress('Houston');
      
      expect(global.fetch).toHaveBeenCalledTimes(1);
      const calledUrl = global.fetch.mock.calls[0][0];
      expect(calledUrl).toContain('q=Houston');
      expect(calledUrl).toContain('appid=k');

      expect(res).toBe(fakeData);
    });

    it('throws HttpError with API message when response not ok and JSON contains message', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: jest.fn().mockResolvedValue({ message: 'city not found' })
      });

      await expect(svc.getWeatherByAddress('X'))
        .rejects
        .toMatchObject({ 
          statusCode: 404, 
          message: 'OpenWeather integration error: city not found' 
        });
    });

    it('throws HttpError with statusText when JSON parsing fails', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        json: jest.fn().mockRejectedValue(new Error('bad json'))
      });

      await expect(svc.getWeatherByAddress('Y, Z'))
        .rejects
        .toMatchObject({ 
          statusCode: 500, 
          message: 'OpenWeather integration error: Server Error' 
        });
    });
  });

  describe('categorizeWeatherByCode', () => {
    let svc;
    beforeAll(() => {
      svc = new OpenWeatherService({ apiKey: 'k' });
    });

    it('returns unknown for non-number or NaN', () => {
      expect(svc.categorizeWeatherByCode('foo')).toBe('unknown');
      expect(svc.categorizeWeatherByCode(NaN)).toBe('unknown');
    });

    it.each([
      [200, 'Thunderstorm'],
      [299, 'Thunderstorm'],
      [300, 'Drizzle'],
      [500, 'Rain'],
      [600, 'Snow'],
      [700, 'Atmosphere'],
      [800, 'Clear'],
      [801, 'Clouds'],
      [850, 'Clouds'],
      [900, 'unknown']
    ])('code %i → %s', (code, expected) => {
      expect(svc.categorizeWeatherByCode(code)).toBe(expected);
    });
  });
});
