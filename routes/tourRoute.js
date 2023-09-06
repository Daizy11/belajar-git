const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoute');

const router = express.Router();
// router.param('id', tourController.checkId);

// create a checkbody middleware func
// check if body contain name and price property
//if not,send back 400 status code (bad request)
//add it to the post handler stack
//tours

// router
//   .route('/:tourId/reviews/')
//   .post(
//     authController.protect,
//     authController.restrictTo('users'),
//     reviewController.createReviews
//   );

router.use('/:tourId/reviews', reviewRouter);
router
  .route('/top-5-cheap')
  .get(tourController.alias, tourController.getAllTour);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getTourWithin);
router.route('/distance/:latlng/unit/:unit').get(tourController.getDistances);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router.route('/tours-stats').get(tourController.getTourStats);
router
  .route('/')
  .get(tourController.getAllTour)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

// getAlltour middleware wont work, because it happen before the route handler
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
<<<<<<< HEAD
=======
    tourController.uploadTourImages,
    tourController.resizeTourImages,
>>>>>>> 12c4885f (Initial commit)
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    tourController.deleteTour
  );

module.exports = router;
