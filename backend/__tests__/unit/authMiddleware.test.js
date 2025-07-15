const jwt = require('jsonwebtoken');
const { verifyToken, isAdmin } = require('../../middleware/authMiddleware');

describe('verifyToken middleware', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env.JWT_SECRET = 'test_secret';

    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('should return 401 if no Authorization header', () => {
    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if Authorization header has no token', () => {
    req.headers.authorization = 'Bearer';
    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if jwt.verify throws', () => {
    req.headers.authorization = 'Bearer invalidtoken';
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('bad token');
    });

    verifyToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      'invalidtoken',
      'test_secret'
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should set req.user and call next() on valid token', () => {
    const decoded = { id: 'user123', role: 'admin' };
    req.headers.authorization = 'Bearer goodtoken';
    jest.spyOn(jwt, 'verify').mockReturnValue(decoded);

    verifyToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      'goodtoken',
      'test_secret'
    );
    expect(req.user).toEqual(decoded);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

describe('isAdmin middleware', () => {
  it('should simply call next()', () => {
    const req = {};
    const res = {};
    const next = jest.fn();

    isAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
