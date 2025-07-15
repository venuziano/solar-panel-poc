const { asyncHandler, HttpError } = require('../../helpers/errorHandler');
const { errorHandler } = require('../../middleware/errorHandler');

describe('HttpError', () => {
  it('should be an instance of Error with correct props', () => {
    const err = new HttpError(418, 'I am a teapot');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(HttpError);
    expect(err.name).toBe('HttpError');
    expect(err.statusCode).toBe(418);
    expect(err.message).toBe('I am a teapot');
    // stack should include constructor name
    expect(err.stack).toContain('HttpError');
  });
});

describe('asyncHandler', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {};
    next = jest.fn();
  });

  it('should call the original fn and resolve', async () => {
    const handler = asyncHandler(async (r, s, n) => {
      r.called = true;
      return 'done';
    });

    const result = handler(req, res, next);
    await expect(result).resolves.toBe('done');
    expect(req.called).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });

  it('should catch a thrown error and forward to next()', async () => {
    const testError = new Error('fail');
    const handler = asyncHandler(async () => { throw testError });
    await handler(req, res, next);
    expect(next).toHaveBeenCalledWith(testError);
  });

  it('should catch a rejected promise and forward to next()', async () => {
    const promiseError = new Error('promise fail');
    const handler = asyncHandler(() => Promise.reject(promiseError));
    await handler(req, res, next);
    expect(next).toHaveBeenCalledWith(promiseError);
  });
});

describe('errorHandler middleware', () => {
  let req, res, next, consoleErrorSpy;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('responds with err.statusCode and message when statusCode present', () => {
    const err = { statusCode: 403, message: 'Forbidden' };
    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('logs and responds 500 when no statusCode', () => {
    const err = new Error('Oops');
    errorHandler(err, req, res, next);

    expect(consoleErrorSpy).toHaveBeenCalledWith(err);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  });
});
