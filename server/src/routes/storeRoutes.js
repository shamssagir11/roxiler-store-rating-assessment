const express = require('express');
const router = express.Router();
const { getAllStores, getStoreById } = require('../controllers/storeController');
const { authenticate } = require('../middleware/auth');

// Stores listing is viewable by authenticated users (and returns their submitted ratings)
router.get('/', authenticate, getAllStores);
router.get('/:id', authenticate, getStoreById);

module.exports = router;
