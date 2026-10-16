const router = require('express').Router();
const routeController = require('../controllers/routeController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// Passengers and drivers can browse routes (public)
router.get('/', routeController.listRoutes);
router.get('/:id', routeController.getRoute);

// Admin only: create/update/delete
router.use(protect);
router.post('/', authorize('Admin'), routeController.createRoute);
router.patch('/:id', authorize('Admin'), routeController.updateRoute);
router.delete('/:id', authorize('Admin'), routeController.deleteRoute);

module.exports = router;
