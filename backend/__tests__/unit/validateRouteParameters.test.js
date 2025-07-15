const { validationResult } = require('express-validator');
const { validateRouteParameters } = require('../../middleware/validateRouteParameter');

jest.mock('express-validator', () => ({
  validationResult: jest.fn()
}));

describe('validateRouteParameters()', () => {
  it('should return an array including all provided validations and the final middleware', () => {
    const dummy1 = jest.fn();
    const dummy2 = jest.fn();
    const handlers = validateRouteParameters([dummy1, dummy2]);

    expect(Array.isArray(handlers)).toBe(true);
    expect(handlers[0]).toBe(dummy1);
    expect(handlers[1]).toBe(dummy2);
    
    const last = handlers[handlers.length - 1];
    expect(typeof last).toBe('function');
  });

  describe('error‐checking middleware', () => {
    let req, res, next, middleware;

    beforeEach(() => {
      const handlers = validateRouteParameters([]);
      middleware = handlers[handlers.length - 1];

      req = {};
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
      validationResult.mockReset();
    });

    it('calls next() when there are no validation errors', () => {
      validationResult.mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      middleware(req, res, next);

      expect(validationResult).toHaveBeenCalledWith(req);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('returns 400 and error array when validation errors exist', () => {
      const fakeErrors = [{ msg: 'bad', param: 'field' }];
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => fakeErrors
      });

      middleware(req, res, next);

      expect(validationResult).toHaveBeenCalledWith(req);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ errors: fakeErrors });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
