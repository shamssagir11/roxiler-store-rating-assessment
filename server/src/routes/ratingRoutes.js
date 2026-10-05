const express = require('express');
const router = express.Router();
const { submitOrUpdateRating, getMyRatings } = require('../controllers/ratingController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Submit or update a 1-5 rating
router.post('/', submitOrUpdateRating);
// User can also update via PUT /:storeId if preferred by REST convention
router.put('/:storeId', (req, res, next) => {
  req.body.storeId = req.params.storeId;
  return submitOrUpdateRating(req, res, next);
});
// Get current user's submitted ratings
router.get('/my', getMyRatings);

module.exports = router;
