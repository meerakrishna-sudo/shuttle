const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const User = require('../models/User');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

router.use(protect);

// Admin: list all users or filter by role
router.get('/', authorize('Admin'), async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };
    if (role) filter.role = role;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      User.countDocuments(filter),
    ]);

    sendPaginated(res, 200, 'Users fetched', users, {
      page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
});

// Admin: deactivate a user
router.patch('/:id/deactivate', authorize('Admin'), async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).select('-passwordHash');
    if (!user) return next(new AppError('User not found', 404));
    sendSuccess(res, 200, 'User deactivated', { user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
