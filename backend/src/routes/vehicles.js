const router = require('express').Router();
const vehicleController = require('../controllers/vehicleController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.use(protect);
router.get('/', authorize('Admin', 'Driver'), vehicleController.listVehicles);
router.post('/', authorize('Admin'), vehicleController.createVehicle);
router.patch('/:id', authorize('Admin'), vehicleController.updateVehicle);
router.delete('/:id', authorize('Admin'), vehicleController.deleteVehicle);

module.exports = router;
