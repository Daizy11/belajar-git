const Tour = require('../models/tourModels');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handleFactory');

//6). Alias
exports.alias = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTour = factory.getAll(Tour);

// const tour = tours.find(el => el.id === id); //loop through the array and in each of iteration,will have access to the current element.Will return true of false
//find method will create an array which only contain element where the comparison turn out to be true
//:x? if there is a question mark, it means optional
// if(id>tours.length){
exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    //aggrregate example
    { $match: { ratingAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 }, // each document will added 1 (count document for ascending)
        numRatings: { $sum: '$ratingQuantity' },
        avgRating: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'easy' } } //ne = not equel
    // }
  ]);
  res.status(201).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; //unwind (only return first element array to doc)
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gt: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' }, //Returns the month of a date as a number between 1 and 12.
        numToursStars: { $sum: 1 }, //
        tours: { $push: '$name' }, //create an array
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: { _id: 0 }, //id will not show up
    },
    {
      $sort: { numToursStars: -1 }, //1 for ascending, -1 for desce
    },
    {
      $limit: 6,
    },
  ]);
  res.status(201).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
// /tour-within/:distance/center/:latlng/unit/:unit
exports.getTourWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  console.log(radius);
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and langitude in the format lnt and lng!',
        400
      )
    );
  }
  const tour = await Tour.find({
    //lng = garis bujur
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }, //find doc within certain geometry
    //center sphere takes an array of cordinates and radius, mongo doenst take the radius, instead it expect a radius in special unit called radian
  }); //find doc within a certain geometry
  res.status(200).json({
    status: 'Success',
    result: tour.length,
    data: {
      data: tour,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  try {
    const { latlng, unit } = req.params; //we do aggregation pipeline for calculation

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    const [lat, lng] = latlng.split(',');
    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitude and langitude in the format lnt and lng!',
          400
        )
      );
    }
    const distances = await Tour.aggregate([
      {
        $geoNear: {
          //require at least 1 field contain a geospatial index, if i have 2 geospatial index you need to use the keys parameter
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1],
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier,
        },
      },
      {
        $project: {
          distance: 1,
          name: 1,
        },
      },
    ]);
    res.status(200).json({
      status: 'Success',
      result: distances.length,
      data: {
        data: distances,
      },
    });
  } catch (err) {
    console.log(err);
  }
});
