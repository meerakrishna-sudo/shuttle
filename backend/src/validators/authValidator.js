/**
 * Joi validators for auth endpoints.
 *
 * Why Joi instead of manual if-checks?
 * With Joi you describe the shape of valid input as a schema object.
 * Joi does the checking, collects ALL errors at once (not just the first),
 * and returns a consistent error format. Much less code than writing
 * if (!email) return res.status(400).json(...)  for every field.
 */
const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((d) => d.message);
    return res.status(400).json({ success: false, message: 'Validation failed', errors: messages });
  }
  next();
};

const registerSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  phoneNumber: Joi.string().pattern(/^\+?[\d\s\-]{7,15}$/).optional(),
  role: Joi.string().valid('Passenger', 'Driver').default('Passenger'),
  licenseNumber: Joi.when('role', {
    is: 'Driver',
    then: Joi.string().required().messages({ 'any.required': 'License number is required for drivers' }),
    otherwise: Joi.string().optional(),
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  role: Joi.string().valid('Passenger', 'Driver', 'Admin').required(),
});

module.exports = {
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
};
