/*eslint-disable  */
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const viewRoute = require('./routes/viewRoute');
const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');
const AppError = require('./utils/appError');
const globalError = require('./controllers/errorController');
const reviewRouter = require('./routes/reviewRoute');

const bookingsRouter = require('./routes/bookingsRoute');
const bookingsController = require('./controllers/bookingController');

const app = express();
app.use(cookieParser());
app.set('view engine', 'pug');
app.use(
  cors({
    origin: 'http://127.0.0.1:3000',
    methods: 'GET,PUT,POST,DELETE',
    credentials: true,
  })
);
app.options('*', cors());
//serving static file
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const scriptSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://*.stripe.com',
];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com/',
];
const connectSrcUrls = [
  'https://unpkg.com',
  'https://tile.openstreetmap.org',
  'ws://localhost:1234/',
  'https://*.stripe.com',
];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:', 'https://*.stripe.com'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:', 'https://*.stripe.com'],
      fontSrc: ["'self'", ...fontSrcUrls],
      frameSrc: ["'self'", 'https://*.stripe.com'],
    },
  })
);
/* directives: {
  defaultSrc: [],
  connectSrc: ["'self'", ...connectSrcUrls],
  scriptSrc: ["'self'", ...scriptSrcUrls], c
  styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls], c
  workerSrc: ["'self'", 'blob:'], c
  objectSrc: [],c
  imgSrc: ["'self'", 'blob:', 'data:', 'https:'], c
  fontSrc: ["'self'", ...fontSrcUrls]
},*/

//1. Global Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  //1. Middleware
  // middleware is a function that can modify the incoming request data because it stand between in the middle of the request and the responds
  // step that the request goes through while being processed. And the step that the request goes through,it simple the data from the body added to it(to reuest obj)  to make a middleware (express.json())
}
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP,please try again in an hour!',
});
app.use(compression());

//limit request for same API
app.use('/api', limiter);

app.post('/webhook-checkout', express.json({type: 'application/json'}), // get data from stripe
bookingsController.webhookCheckout
);
app.use(bodyParser.json())
//body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

app.use(express.urlencoded({ extended: true, limit: '10kb' })); // parse data from url client side(form)

//Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data Sanitization against XSS
app.use(xss()); //cross site scripting

//Prevent parameter polution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'prize',
    ],
  })
);

//test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//3. Route
app.use('/api/v1/tours', tourRouter); // parent route
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.use('/api/v1/bookings', bookingsRouter);

app.use('/', viewRoute);

app.use('/api/v1/tours/:id', tourRouter);
app.use('/api/v1/reviews/:id', reviewRouter);
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
