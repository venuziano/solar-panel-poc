/**
 * All available permissions in the system.
 * @readonly
 * @enum {string}
 */
const PERMISSIONS = Object.freeze({
  CREATE_INSTALLATION: 'create_installation',
  VIEW_INSTALLATIONS:  'view_installations',
});

/**
 * All user roles in the system.
 * @readonly
 * @enum {string}
 */
const USER_ROLES = Object.freeze({
  ADMIN: 'admin',
  TECHNICIAN: 'technician'
});

/**
 * Maps each user role to its granted permissions.
 * @type {Object.<string, string[]>}
 */
const rolePermissions = {
  [USER_ROLES.ADMIN]: Object.values(PERMISSIONS),             
  [USER_ROLES.TECHNICIAN]: [ PERMISSIONS.VIEW_INSTALLATIONS ]
};

/**
 * Express middleware generator that checks whether the authenticated user
 * has the required permission.
 *
 * @param {string} permission - The permission to verify.
 * @returns {(req: Request, res: Response, next: NextFunction) => void}
 *   An Express middleware function which:
 *   1. Returns 401 if `req.user` is missing or invalid.
 *   2. Returns 403 if the user’s role is invalid or lacks the permission.
 *   3. Otherwise, calls `next()` to proceed.
 */
function hasPermission(permission) {
  return (req, res, next) => {
    if (!req.user || typeof req.user !== 'object') {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { role } = req.user;

    if (typeof role !== 'string' || !Object.values(USER_ROLES).includes(role)) {
      return res.status(403).json({ message: 'Invalid role' });
    }

    const perms = rolePermissions[role] || [];
  
    if (!perms.includes(permission)) {
      return res.status(403).json({ message: 'User has no permission' });
    }
    next();
  };
}

module.exports = { USER_ROLES, hasPermission, PERMISSIONS }

