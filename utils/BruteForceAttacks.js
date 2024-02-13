const rateLimter = require('express-rate-limit');

const loginLimiter = rateLimter({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requestes from this IP, Please try again in an hour',
});

exports.module = loginLimiter;
