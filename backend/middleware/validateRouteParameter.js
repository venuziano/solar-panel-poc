const { validationResult } = require('express-validator');

/**
 * Validates if the parameters of an endpoint are valid.
 *
 * @param {import('express-validator').ValidationChain[]} validations
 * @returns {import('express').RequestHandler[]}  
 */
function validateRouteParameters(validations) {
  return [
    ...validations,
  
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ errors: errors.array() });
      }
      next();
    }
  ];
}

module.exports = { validateRouteParameters }