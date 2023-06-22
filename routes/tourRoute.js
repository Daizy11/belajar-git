const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();
// router.param('id', tourController.checkId);

// create a checkbody middleware func
// check if body contain name and price property
//if not,send back 400 status code (bad request)
//add it to the post handler stack
//tours
router
  .route('/top-5-cheap')
  .get(tourController.alias, tourController.getAllTour);
  
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router.route('/tours-stats').get(tourController.getTourStats);
router
  .route('/')
  .get(tourController.getAllTour)
  .post(tourController.createTour);

// getAlltour middleware wont work, because it happen before the route handler
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
