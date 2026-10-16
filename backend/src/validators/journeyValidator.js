const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((d) => d.message);
    return res.status(400).json({ success: false, message: 'Validation failed', errors: messages });
  }
  next();
};

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:MM

const createJourneySchema = Joi.object({
  route: Joi.string().hex().length(24).required(),
  date: Joi.date().iso().min('now').required(),
  departureTime: Joi.string().pattern(timePattern).required().messages({
    'string.pattern.base': 'departureTime must be HH:MM format',
  }),
  arrivalTime: Joi.string().pattern(timePattern).optional(),
  vehicle: Joi.string().hex().length(24).required(),
  driver: Joi.string().hex().length(24).required(),
  totalSeats: Joi.number().integer().min(1).max(100).required(),
  notes: Joi.string().max(300).optional(),
});

const updateJourneySchema = Joi.object({
  status: Joi.string().valid('Scheduled', 'Ongoing', 'Completed', 'Cancelled').optional(),
  delayMinutes: Joi.number().integer().min(0).optional(),
  currentStop: Joi.string().hex().length(24).optional(),
  notes: Joi.string().max(300).optional(),
});

module.exports = {
  validateCreateJourney: validate(createJourneySchema),
  validateUpdateJourney: validate(updateJourneySchema),
};
