/* eslint-disable arrow-body-style */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-sequences */
const { promisify } = require('util');
/* eslint-disable import/order */
const User = require('../models/userModel');
/* eslint-disable import/no-extraneous-dependencies */
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

// eslint-disable-next-line arrow-body-style
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cokkieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cokkieOptions.secure = true;
  res.cookie('jwt', token, cokkieOptions);

  // delete the password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: req.body.passwordChangedAt,
      role: req.body.role,
    });
    // const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    //   expiresIn: process.env.JWT_EXPIRES_IN,
    // });
    createSendToken(newUser, 201, res);
    // const token = signToken(newUser._id);

    // res.status(201).json({
    //   status: 'success',
    //   token,
    //   data: {
    //     user: newUser,
    //   },
    // });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // check if email and password exist
  if (!email || !password) {
    // return next(new AppError('Please prvide email and password', 400));
    res.status(400).json({
      status: 'fail',
      message: 'Please provide email and password',
    });
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  // const correct = await user.correctPassword(password, user.password);

  if (!user || !(await user.correctPassword(password, user.password))) {
    // return next(new AppError('Incorrect email or password', 401));
    res.status(400).json({
      status: 'fail',
      message: 'Incorrect email or password',
    });
  }
  //3) If every thing ok , send token to client
  createSendToken(user, 200, res);
  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: 'success',
  //   token: token,
  // });
});

// exports.protect = catchAsync(async (req, res, next) => {
//   // getting goken and chech of it's there
//   let token;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer')
//   ) {
//     token = await req.headers.authorization.split(' ')[1];
//   }
//   // console.log(token);
//   if (!token) {
//     res.status(401).json({
//       status: 'fail',
//       message: 'You are not logged in! Please login to get access.',
//     });
//   }

//   // Verification
//   const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

//   // Check if user still exists
//   const currentUser = await User.findById(decode.id);
//   // if (!currentUser) {
//   //   return next(
//   //     new AppError('The user belonging to this token does no longer exist.'),
//   //   );
//   // }
//   if (!currentUser) {
//     res.status(401).json({
//       status: 'fail',
//       message: 'he user belonging to this token does no longer exist.',
//     });
//   }
//   // check if user changed password after the token was issued
//   // if (currentUser.changedPasswordAfter(decode.iat)) {
//   //   return next(
//   //     new AppError('User recently changed password! Please log in again.', 401),
//   //   );
//   // }
//   if (currentUser.changedPasswordAfter(decode.iat)) {
//     res.status(401).json({
//       status: 'fail',
//       message: 'User recently changed password! Please log in again',
//     });
//   }
//   // Access to protected route
//   req.user = currentUser;
//   next();
// });

exports.protect = catchAsync(async (req, res, next) => {
  // Getting token and check of it's there
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      res.status(401).json({
        status: 'fail',
        message: 'You are not login, please login to get access!',
      });
    }
    // 2) verification token
    let decode;
    try {
      decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    } catch (err) {
      res.status(401).json({
        status: 'fail',
        message: 'invalid token, please log in again',
      });
    }

    // check if user still exist
    const currentUser = await User.findById(decode.id);
    if (!currentUser) {
      res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token does no longer exist.',
      });
    }

    if (currentUser.changedPasswordAfter(decode.iat)) {
      res.status(401).json({
        status: 'fail',
        message: 'User recently changed password! Please log in again',
      });
    }
    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({ status: 'fail', message: err });
  }
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin','lead-guide'] roles 'user' => example
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to performe this action',
      });
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // find user by email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    // return next(new AppError('This is no user with email address', 404));
    res.status(404).json({
      status: 'fail',
      message: 'This is no user with email address',
    });
  }

  // Generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot Your password? submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forgot password , please ignore this email!`;

  try {
    await sendEmail({
      email: user.email, // req.body.email
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({
      status: 'fail',
      message: 'There was an error sending email, try again later',
    });
    // return next(
    //   new AppError('There was an error sending email, try again later', 500),
    // );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get user pased on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // if token has not expired, and there is user, set the new password
  if (!user) {
    res
      .status(400)
      .json({ status: 'fail', message: 'Token is invalid or has expired' });
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //3) update passwordChangedAt property for the user
  //4)login the user in, send JWT
  createSendToken(user, 200, res);
  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: 'success',
  //   token: token,
  // });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // Check if posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    res.status(401).json({
      status: 'fail',
      message: 'Your current password is worng',
    });
  }
  //3) update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) login user in, send JWT
  createSendToken(user, 200, res);
  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: 'success',
  //   token: token,
  // });
});
