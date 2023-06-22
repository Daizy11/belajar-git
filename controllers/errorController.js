const AppError = require('../utils/appError');


const handleDuplicateFieldDb = (err) => {
  const field = Object.keys(err.keyValue);
  const value = Object.values(err.keyValue);
  const message = `Duplicate ${field}: ${value}`;
  return new AppError(message,400)
};

const handleCastErrorDb = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`; //path = field yg error
  return new AppError(message, 400);
};
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperasional) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack)
  // show where the error hsppen
  //global error handling middleware
  err.statusCode = err.statusCode || 500; //internal server error
  err.status = err.status || 'error';
  console.log(err)
  if (process.env.NODE_ENV === 'development') {
    console.log('entry dev')
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);
    
    if (error.name === 'CastError') {
      error = handleCastErrorDb(error);
    }
    sendErrorProd(error, res);
   
  }
};
