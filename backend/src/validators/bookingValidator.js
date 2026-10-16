const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((d) => d.message);
    return res.status(400).json({ success: false, message: 'Validation failed', errors: messages });
  }
  next();
};

const createBookingSchema = Joi.object({
  journeyId: Joi.string().hex().length(24).required().messages({
    'string.length': 'journeyId must be a valid MongoDB ObjectId',
  }),
  seatNumbers: Joi.array().items(Joi.string().trim()).min(1).max(6).required().messages({
    'array.min': 'Select at least one seat',
    'array.max': 'Cannot book more than 6 seats at once',
  }),
  paymentMethod: Joi.string().valid('Card', 'UPI', 'Cash').default('UPI'),
  notes: Joi.string().max(200).optional(),
});

module.exports = {
  validateCreateBooking: validate(createBookingSchema),
};
