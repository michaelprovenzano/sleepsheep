const AppError = require('../utils/appError');

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  // Rendered website
  let title = 'Something went wrong!';
  if (err.statusCode == 404) title = 'Page not found!';

  console.log('ERROR', err);

  return res.status(err.statusCode).render('error', {
    title,
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // API | Error Handling
  if (req.originalUrl.startsWith('/api')) {
    // Operational error, (i.e. user error): It's okay to send message to client
    if (err.isOperational) {
      return res.status(404).json({
        status: err.status,
        message: err.message,
      });

      // Programming or other unknown error: Do not leak the error details
    }

    // Log the error to the node console (this is not visible to the user)
    console.error('ERROR', err);

    // Send the generated message to the user
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }

  // RENDERED WEBSITE | Error Handling
  let title = 'Something went wrong!';
  if (err.statusCode == 404) title = 'Page not found!';

  // Operational error, (i.e. user error): It's okay to send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title,
      msg: err.message,
    });

    // Programming or other unknown error: Do not leak the error details
  }

  // Log the error to the node console (this is not visible to the user)
  console.error('ERROR', err);

  // Send the generated message to the user
  return res.status(err.statusCode).render('error', {
    title,
    msg: 'Please try again later.',
  });
};

// Handles invalid ID requests and other Mongoose CastErrors
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleJWTError = (err) => {
  return new AppError('Invalid token. Please log in again.', 401);
};

const handleJWTExpiredError = (err) => {
  return new AppError('Your token has expired. Please log in again.', 401);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // Send more meaningful errors for Mongoose errors
    let error = { ...err };
    error.message = err.message;

    // if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError')
      error = handleJWTExpiredError(error);

    sendErrorProd(error, req, res);
  }
};
