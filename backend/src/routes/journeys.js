const router = require('express').Router();
const journeyController = require('../controllers/journeyController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validateCreateJourney, validateUpdateJourney } = require('../validators/journeyValidator');

// Public: search available journeys (passengers don't need to be logged in to search)
router.get('/search', journeyController.searchJourneys);

// Protected routes below
router.use(protect);

// Driver: view own assigned journeys
router.get('/my', authorize('Driver'), journeyController.getDriverJourneys);

// Admin: CRUD
router.get('/', authorize('Admin'), journeyController.listJourneys);
router.post('/', authorize('Admin'), validateCreateJourney, journeyController.createJourney);

router.get('/:id', journeyController.getJourney); // any authenticated user
router.patch('/:id', authorize('Admin', 'Driver'), validateUpdateJourney, journeyController.updateJourney);

module.exports = router;
