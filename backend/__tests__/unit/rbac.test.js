const { hasPermission, USER_ROLES, PERMISSIONS } = require('../../helpers/rbac');

describe('hasPermission middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('returns 401 if req.user is missing', () => {
    const mw = hasPermission(PERMISSIONS.VIEW_INSTALLATIONS);
    mw(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Authentication required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 if req.user is not an object', () => {
    req.user = 'not-an-object';
    const mw = hasPermission(PERMISSIONS.VIEW_INSTALLATIONS);
    mw(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Authentication required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 if role is missing or invalid', () => {
    // missing role
    req.user = {};
    hasPermission(PERMISSIONS.VIEW_INSTALLATIONS)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid role' });
    expect(next).not.toHaveBeenCalled();

    // invalid role value
    res.status.mockClear();
    res.json.mockClear();
    req.user = { role: 'unknown' };
    hasPermission(PERMISSIONS.VIEW_INSTALLATIONS)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid role' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 if the user lacks the required permission', () => {
    req.user = { role: USER_ROLES.TECHNICIAN };
    const mw = hasPermission(PERMISSIONS.CREATE_INSTALLATION);
    mw(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'User has no permission' });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() if the user has the required permission', () => {
    req.user = { role: USER_ROLES.ADMIN };
    const mw = hasPermission(PERMISSIONS.CREATE_INSTALLATION);
    mw(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
