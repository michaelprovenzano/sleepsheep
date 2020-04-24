const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const AppError = require('./utils/appError');
const userRouter = require('./routes/userRouter');
const sleepLogsRouter = require('./routes/sleepLogsRouter');
const trackableRouter = require('./routes/trackableRouter');
const viewRouter = require('./routes/viewRouter');
const globalErrorHandler = require('./controllers/errorController');

// Start express app
const app = express();

app.enable('trust proxy');

// Set up PUG
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Use morgan for logging HTTP requests
app.use(morgan('dev'));

// Set security HTTP headers
app.use(helmet());

// Limit requests from the same IP address
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message:
    'Too many requests have been sent from this IP. Please try again in an hour.',
});
app.use('/api', limiter);

// Read the data from the body and put in req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: ['sleepQuality', 'timeToFallAsleep'],
  })
);

// Compress all JSON and text sent to user
app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ROUTES
app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/sleepLogs', sleepLogsRouter);
app.use('/api/v1/trackables', trackableRouter);
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
