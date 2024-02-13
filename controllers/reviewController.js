// const APIFeatures = require('../utils/apiFeatures');
const Review = require('../models/reviewModel');
const factory = require('./factoryHandler');
// Get All Tours
exports.getAllReviews = factory.getAll(Review);

// get review by id
exports.getReview = factory.getOne(Review);

exports.setTourUserId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
// Add New Review
exports.createReview = factory.createOne(Review);
// exports.createReview = async (req, res) => {
//   try {
//     if (!req.body.tour) req.body.tour = req.params.tourId;
//     if (!req.body.user) req.body.user = req.user.id;
//     const newReview = await Review.create(req.body);

//     res.status(200).json({
//       status: 'success',
//       data: {
//         review: newReview,
//       },
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: 'fail',
//       message: err,
//     });
//   }
// };

// delete review
exports.deleteReview = factory.deleteOne(Review);
// update review
exports.updateReview = factory.updateOne(Review);
