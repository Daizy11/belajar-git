const express = require('express');
<<<<<<< HEAD
const viewController = require('../controllers/viewsController')
const authController = require('../controllers/authController')

=======
const viewController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
>>>>>>> 12c4885f (Initial commit)
const route = express.Router();

// route.get('/overview', (req, res) => {
//   res.status(200).render('overview', {
//     title: 'All Tour',
//   });
// });
<<<<<<< HEAD
route.use(authController.isLoggedIn)

route.get('/tour/:slug',viewController.getTour);
route.get('/',viewController.getOverview);
route.get('/login',viewController.login)


module.exports = route;

=======

route.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
route.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview
);
route.get('/login', authController.isLoggedIn, viewController.login);
route.get('/me', authController.protect, viewController.getAccount);
route.get('/my-tours', authController.protect, viewController.getMyTours);

route.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData
);

module.exports = route;
>>>>>>> 12c4885f (Initial commit)
