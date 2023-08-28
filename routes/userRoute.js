const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const userRouter = express.Router();
//users
  
userRouter.post('/signup',authController.signup)
userRouter.post('/login',authController.login)

userRouter.use(authController.protect)
userRouter.post('/forgotPassword',authController.forgotPassword)
userRouter.patch('/resetPassword/:token',authController.resetPassword)

userRouter.get("/me",userController.getMe,userController.getUsers)
userRouter.patch('/updateMyPassword', authController.updatePassword)

userRouter.patch('/updateMe', userController.updateMe)
userRouter.delete('/deleteMe', userController.deleteMe)

userRouter.use(authController.restrictTo('admin'))

userRouter
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
userRouter
  .route('/:id')
  .get(userController.getUsers)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);


module.exports = userRouter;
