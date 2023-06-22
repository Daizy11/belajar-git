const express = require('express');
const userController = require('../controllers/userController');

const userRouter = express.Router();
//users
userRouter
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
userRouter
  .route(':id')
  .get(userController.getUsers)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
