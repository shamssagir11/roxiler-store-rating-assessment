const express = require('express');
const router = express.Router();
const { getOwnerDashboard, getOwnerRatings } = require('../controllers/ownerController');
const { authenticate, authorize } = require('../middleware/auth');

// All Owner routes require authentication and STORE_OWNER role
router.use(authenticate, authorize('STORE_OWNER'));

router.get('/dashboard', getOwnerDashboard);
router.get('/ratings', getOwnerRatings);

module.exports = router;
