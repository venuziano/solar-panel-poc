const express = require('express');
const router = express.Router();
const { query, body } = require('express-validator');

const authMiddleware = require('../middleware/authMiddleware');
const { hasPermission, PERMISSIONS } = require('../helpers/rbac');
const { asyncHandler } = require('../helpers/errorHandler');
const { InstallationService } = require('../services/installationService');
const OpenWeatherService = require('../services/weatherService');
const { validateRouteParameters } = require('../middleware/validateRouteParameter');
const { INSTALLATION_STATUS } = require('../seeds/installations');
const { paginationValidators } = require('../routeValidators/paginationValidators');

const openWeatherService = new OpenWeatherService()
const installationService = new InstallationService({ openWeatherService })

const VALID_STATUSES = Object.values(INSTALLATION_STATUS);

router.get(
  '/installations', 
  authMiddleware.verifyToken, 
  hasPermission(PERMISSIONS.VIEW_INSTALLATIONS),
  ...validateRouteParameters([
    ...paginationValidators,
    query('status')
      .optional()
      .isIn(VALID_STATUSES)
      .withMessage(`status must be one of: ${VALID_STATUSES.join(', ')}`)
      .trim(),
  ]),
  asyncHandler(async(req, res) => {
    const { page, limit, status } = req.query
    res.json(await installationService.getInstallations(status, page, limit));
  })
);

router.post(
  '/installations', 
  authMiddleware.verifyToken, 
  hasPermission(PERMISSIONS.CREATE_INSTALLATION),
  ...validateRouteParameters([
    body('date')
      .exists().withMessage('date is required')
      .isISO8601().withMessage('date must be a valid ISO 8601 date'),

    body('address')
      .exists().withMessage('address is required')
      .isString().withMessage('address must be a string')
      .notEmpty().withMessage('address cannot be empty')
      .trim(),

    body('state')
      .exists().withMessage('state is required')
      .isString().withMessage('state must be a string')
      .notEmpty().withMessage('state cannot be empty')
      .trim(),

    body('panelCapacity_kW')
      .exists().withMessage('panelCapacity_kW is required')
      .isFloat({ min: 0.1 }).withMessage('panelCapacity_kW must be a number ≥ 0.1')
      .toFloat(),
    
    body('efficiency')
      .exists().withMessage('efficiency is required')
      .isFloat({ min: 0, max: 1 }).withMessage('efficiency must be a number between 0 and 1')
      .toFloat(),
  
    body('electricityRate')
      .exists().withMessage('electricityRate is required')
      .isFloat({ min: 0 }).withMessage('electricityRate must be a non-negative number')
      .toFloat(),
  ]),
  asyncHandler(async(req, res) => {
    await installationService.create(req.body)
    res.status(201).json({ message: 'Installation created successfully' });
  })
);

// I’d add an endpoint for the tech user so they can update the installation status after completing service at the customer’s home or building.

module.exports = router;
