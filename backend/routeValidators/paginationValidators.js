const { query } = require('express-validator');

/**
 * Array of Express-validator chains to validate pagination query parameters.
 *
 * - `page`: optional; must be an integer ≥ 1; coerced to number
 * - `limit`: optional; must be an integer between 1 and 100; coerced to number
 *
 * @type {ValidationChain[]}
 */
const paginationValidators = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be an integer >= 1')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be an integer between 1 and 100')
    .toInt()
];

module.exports = { paginationValidators };