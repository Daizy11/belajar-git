const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');
const AppError = require('./utils/appError');
const globalError = require('./controllers/errorController');

const app = express();
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  //1. Middleware
  app.use(express.json()); // to make a middleware (express.json())
  // middleware is a function that can modify the incoming request data because it stand between in the middle of the request and the responds
  // step that the request goes through while being processed. And the step that the request goes through,it simple the data from the body added to it(to reuest obj)
  
}
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//3. Route
app.use('/api/v1/tours', tourRouter); // parent route
app.use('/api/v1/users', userRouter);

app.use('/api/v1/tours/:id', tourRouter);
app.use('/api/v1/users/:id', userRouter);

app.all('*', (req, res, next) => {
  //handling unhandled route
  next(new AppError(`Cant fint ${req.originalUrl} on this server`, 404));

  // const err = new Error(`Cant fint ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  //whenever we pass an argument to next, it auto recognize an error
  //.will skip in all middleware stack and sent the error to global error middleware
});
app.use(globalError);

//server
module.exports = app;
