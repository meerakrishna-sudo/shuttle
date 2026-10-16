const router = require('express').Router();
const busStopController = require('../controllers/busStopController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.get('/', busStopController.listBusStops); // public

router.use(protect);
router.post('/', authorize('Admin'), busStopController.createBusStop);
router.patch('/:id', authorize('Admin'), busStopController.updateBusStop);
router.delete('/:id', authorize('Admin'), busStopController.deleteBusStop);

module.exports = router;
