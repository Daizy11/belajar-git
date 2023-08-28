const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true }); // mergeParams is for get access of other router params
router.use(authController.protect);
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReviews
  );

// getAllReviews middleware wont work, because it happen before the route handler
router
  .route('/:id')
  .delete(reviewController.deleteReviews)
  .patch(authController.restrictTo('user','admin'),reviewController.updateReviews)
  .get(authController.restrictTo('user','admin'),reviewController.getReviews);

module.exports = router;
