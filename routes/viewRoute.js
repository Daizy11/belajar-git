const express = require('express');

const viewController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const route = express.Router();

// route.get('/overview', (req, res) => {
//   res.status(200).render('overview', {
//     title: 'All Tour',
//   });
// });


route.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
route.get(
  '/',
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
