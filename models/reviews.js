const mongoose = require('mongoose');
const tourModel = require('./tourModels');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      trim: true,
      require: [true, 'require cant be empty'],
    },
    ratings: {
      type: Number,

      min: 1,
      max: 5,
    },
    createAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'review must belong to a tour'], // Corrected "require" to "required"
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'review must belong to a user'], // Corrected "require" to "required"
    },
  },
  {
    //schema option for when have virtual property
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // static method used to calculate and update the average ratings of a tour based on the reviews associated with that tour.
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$ratings' },
      },
    },
  ]);
  console.log(stats.length > 0);
  if (stats) {
    await tourModel.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await tourModel.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  //this point to current review, for implement the static function
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.clone().findOne(); //supaya bisa nge pass value findOne
  console.log(this.r); //this refers to the query, not the document
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  //this.findOne is not work here,the query is already execute
  if (this.r) {
    // To avoid errors, you should only proceed with calculations if this.r is not null.
    await this.r.constructor.calcAverageRatings(this.r.tour);
  }
});

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    //if want to apply in all, never duplicate the code, use query middleware instead
    path: 'user',
    select: 'name photo',
  });
  next();
});

//if u dont want array grow indefinately, use virtual populate
const review = mongoose.model('Review', reviewSchema);

module.exports = review;
