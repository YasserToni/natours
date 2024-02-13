/* eslint-disable import/order */
/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const express = require('express');
const morgan = require('morgan');

const tourRouter = require(`./routes/tourRoutes`);
const userRouter = require(`./routes/userRoutes`);
const reviewRouter = require(`./routes/reviewRoutes`);
const viewRouter = require(`./routes/viewRoutes`);
const bookingRouter = require(`./routes/bookingRoute`);
// const AppError = require(`./utils/appError`);
const rateLimter = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const globalErrorHandler = require('./controllers/errorController');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const app = express();
//  Global Middleware

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/index', (req, res) => {
  res.render('index');
});
//Serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

// 1)set security http headers
app.use(helmet({ contentSecurityPolicy: false }));

// 2) development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// console.log(process.env.NODE_ENV);

// 3) limit requiests from same api
const limiter = rateLimter({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requestes from this IP, Please try again in an hour',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data sanitization against xss
app.use(xss());

// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// Test middleware
app.use((req, res, next) => {
  console.log(`Hello from middleware 😎`);
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  // console.log(req.cookies);
  next();
});

// create a route
// app.get(`/`, (req, res) => {
//   res.status(200).json({
//     message: 'Hello form server side !',
//     app: 'Natours',
//   });
// });

// // create route
// app.post(`/`, (req, res) => {
//   res.send('You can post to this endPoint');
// });

// app.get(`/api/v1/tours`, getAllTours);
// app.post(`/api/v1/tours`, addNewTour);
// app.get(`/api/v1/tours/:id`, getTour);
// app.patch(`/api/v1/tours/:id`, updateTour);
// app.delete(`/api/v1/tours/:id`, deleteTour);

// app.get('/', (req, res) => {
//   res.status(200).render('base');
// });

app.use(`/`, viewRouter);
app.use(`/api/v1/tours`, tourRouter);
app.use(`/api/v1/users`, userRouter);
app.use(`/api/v1/reviews`, reviewRouter);
app.use(`/api/v1/bookings`, bookingRouter);

app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} in this server`,
  });

  // const err = new Error(`Can't find ${req.originalUrl} in this server`);
  // err.statusCode = 404;
  // err.status = 'fail';
  // next(err);

  // next(new AppError(`Can't find ${req.originalUrl} in this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
