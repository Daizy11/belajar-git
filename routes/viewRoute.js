const express = require('express');
const viewController = require('../controllers/viewsController')
const authController = require('../controllers/authController')

const route = express.Router();

// route.get('/overview', (req, res) => {
//   res.status(200).render('overview', {
//     title: 'All Tour',
//   });
// });
route.use(authController.isLoggedIn)

route.get('/tour/:slug',viewController.getTour);
route.get('/',viewController.getOverview);
route.get('/login',viewController.login)


module.exports = route;

