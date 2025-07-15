const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { body } = require('express-validator');

const { users } = require('../seeds/users');
const { validateRouteParameters } = require('../middleware/validateRouteParameter');

router.post(
  '/login',
  ...validateRouteParameters([
    body('username')
      .exists().withMessage('username is required')
      .isString().withMessage('username must be a string')
      .trim(),
    body('password')
      .exists().withMessage('password is required')
      .isString().withMessage('password must be a string'),
  ]),
  (req, res) => {
    const { username, password } = req.body;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
      // We could log it into the log database table.
      return res.status(404).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userUUID: user.uuid, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        uuid: user.uuid,
        username: user.username,
        role: user.role
      }
    });
});

module.exports = router;
