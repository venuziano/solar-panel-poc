const crypto = require('crypto');

const { USER_ROLES } = require("../helpers/rbac");

const users = [
    { id: 1, username: 'admin', password: 'admin123', role: USER_ROLES.ADMIN, uuid: crypto.randomUUID() },
    { id: 2, username: 'tech', password: 'tech123', role: USER_ROLES.TECHNICIAN, uuid: crypto.randomUUID() }
  ];

module.exports = { users }