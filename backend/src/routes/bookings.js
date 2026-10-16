const router = require('express').Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validateCreateBooking } = require('../validators/bookingValidator');

// All routes require authentication
router.use(protect);

router.post('/', authorize('Passenger'), validateCreateBooking, bookingController.createBooking);
router.get('/my', authorize('Passenger'), bookingController.getMyBookings);
router.patch('/:id/cancel', authorize('Passenger'), bookingController.cancelBooking);

// Driver or Admin can see passengers on a journey
router.get('/journey/:journeyId', authorize('Driver', 'Admin'), bookingController.getJourneyPassengers);

module.exports = router;
