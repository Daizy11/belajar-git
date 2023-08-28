const reviewSchema = require('../models/reviews');
// const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');
const factory = require('./handleFactory')

exports.getAllReviews =factory.getAll(reviewSchema)


exports.setTourUserIds = (req,res,next)=>{
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next()
}
exports.getReviews = factory.getOne(reviewSchema)

exports.createReviews = factory.createOne(reviewSchema)

exports.updateReviews = factory.updateOne(reviewSchema)

exports.deleteReviews = factory.deleteOne(reviewSchema);
