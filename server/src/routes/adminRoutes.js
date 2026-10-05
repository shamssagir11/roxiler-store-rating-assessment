const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  getUserById,
  createUser,
  getStores,
  createStore,
  getEligibleOwners,
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

// All Admin routes require authentication and ADMIN role
router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.get('/stores', getStores);
router.post('/stores', createStore);
router.get('/eligible-owners', getEligibleOwners);

module.exports = router;
