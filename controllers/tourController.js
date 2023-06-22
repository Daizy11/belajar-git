const Tour = require('../models/tourModels');
const APIFeatures = require('../utils/APIFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// const tours = JSON.parse(
//   //convert json array to an object
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// ); // patch for modify (update)

// exports.checkId = (req, res, next, val) => {
// console.log(`TOur id is ${val}`);
// const id = req.params.id * 1;
// const tour = tours.find(el => el.id === id);

//   res.status(404).json({
//       // if the return doesnt exist, express will send back the res but it still continue running the code
//       status: 'fail', // return means the function will get return(it'll get finish) and wont go to the next function
//       message: 'Invalid ID'
//     });

//   next();
// };

//6). Alias
exports.alias = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTour = catchAsync(async (req, res, next) => {
  //execute
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sorting()
    .limitField()
    .pagination();
  const tours = await features.query;

  // const tours = await (await Tour.find()
  //   .where('duration')
  //   .equals(5)
  //   .where('difficulty')).equals('easy');

  //send res
  res.status(200).json({
    status: 'success',
    result: tours.length, //for specify the information for client
    data: {
      tours, //:tours = json parse
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  //:id is to define variable

  const getTour = await Tour.findById(req.params.id);

  if (!getTour) {
    return next(new AppError('No Tour found in that ID', 404));
  } // next() argument will jump straight to global error middleware
  //Tour.findOne({_id:req.params.id})
  res.status(200).json({
    status: 'success',
    data: {
      getTour,
    },
  });
});

// const tour = tours.find(el => el.id === id); //loop through the array and in each of iteration,will have access to the current element.Will return true of false
//find method will create an array which only contain element where the comparison turn out to be true
//:x? if there is a question mark, it means optional
// if(id>tours.length){

exports.createTour = async (req, res, next) => {
  try{
    const newTour = await Tour.create(req.body);
    console.log(newTour);
    if (!newTour){
      return next(new AppError('No Tour found in that ID', 404))
    }
   
    // next() argument will jump straight to global error middleware
    res.status(201).json({
      status: 'success',
      data: {
        tours: newTour,
      },
    });
  }catch(err){
    res.status(400).json({
      status:"fail",
      message:err.message
    })
  }
};

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(201).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  await Tour.findByIdAndDelete(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(204).json({
    //204 means no-content
    message: 'success',
    data: null,
  });
});

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
