const crypto = require('crypto');

const mockUserUUID = crypto.randomUUID()

jest.mock('express-validator', () => {
    const chain = {
      exists: jest.fn().mockReturnThis(),
      withMessage: jest.fn().mockReturnThis(),
      isString: jest.fn().mockReturnThis(),
    };
    return { body: jest.fn(() => chain) };
  });
  
  jest.mock('../../middleware/validateRouteParameter', () => ({
    validateRouteParameters: () => []
  }));
  
  jest.mock('../../seeds/users', () => ({
    users: [ { id: 1, uuid: mockUserUUID, username: 'alice', password: 'secret', role: 'admin' } ]
  }));
  
  const jwt = require('jsonwebtoken');
  jest.mock('jsonwebtoken');
  
  const router = require('../../routes/auth');
  
  const loginLayer = router.stack.find(layer => layer.route?.path === '/login');
  const loginHandler = loginLayer.route.stack.find(l => l.method === 'post').handle;
  
  describe('POST /login handler (unit)', () => {
    let req, res, next;
  
    beforeEach(() => {
      // reset mocks
      jwt.sign.mockReset();
  
      req = { body: {} };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });
  
    it('returns 401 when credentials are wrong', () => {
      req.body = { username: 'bob', password: 'wrong' };
      loginHandler(req, res, next);
  
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
      expect(next).not.toHaveBeenCalled();
    });
  
    it('signs and returns a token on valid credentials', () => {
      req.body = { username: 'alice', password: 'secret' };
      jwt.sign.mockReturnValue('fake-jwt-token');
  
      loginHandler(req, res, next);
  
      expect(jwt.sign).toHaveBeenCalledWith(
        { userUUID: mockUserUUID, username: 'alice', role: 'admin' },
        process.env.JWT_SECRET || 'your_jwt_secret_key',
        { expiresIn: '2h' }
      );
      expect(res.json).toHaveBeenCalledWith({
        token: 'fake-jwt-token',
        user: { uuid: mockUserUUID, username: 'alice', role: 'admin' }
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
  