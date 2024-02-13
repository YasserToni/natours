const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');

exports.getOverview = catchAsync(async (req, res, next) => {
  // Get tour data from collection
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'There is no tour with that name',
    });
  }
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});
exports.login = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
});
exports.signup = catchAsync(async (req, res, next) => {
  res.status(200).render('signup', {
    title: 'Create New account',
  });
});
exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account',
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });
  res.status(200).render('overview', {
    title: 'My-Tours',
    tours,
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updateduser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      runValidators: true,
      new: true,
    },
  );
  res.status(200).render('account', {
    title: 'Your Account',
    user: updateduser,
  });
});
