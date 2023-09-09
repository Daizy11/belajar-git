const booking = require('../models/bookingsModel');
const Tour = require('../models/tourModels');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handleFactory');
const Stripe = require('stripe');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1 Create the currently book tour

  const stripe = Stripe(process.env.STRIPE_SECTRET);
  const tour = await Tour.findById(req.params.tourID);
  //2) create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'] /* info about session */,
    // success_url: `${req.protocol}://127.0.0.1:3000/?tour=${req.params.tourID}&user=${req.user.id}&price=${tour.price}`,
    success_url: `${req.protocol}://127.0.0.1:3000/my-tours`,
    cancel_url: `${req.protocol}://127.0.0.1:3000/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourID,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://127.0.0.1:3000/img/tours/${tour.imageCover}`
            ],
          },
        },
      },
    ],
    mode: 'payment',
  });
  //3) create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//     // this is only temporary,because its Unsecure:everyone can make bookings without paying
//   const { tour, price, user } = req.query;

//   if (!tour && !user && !price) return next();
//   await booking.create({ tour, user, price });

//   res.redirect(req.originalUrl.split('?')[0])
// });
const createBookingCheckout = async (session) => {
  const tour = session.client_reference_id;
  const user = 200
  const price = session.amount_total / 100;
  await booking.create({ tour, user, price });
};

exports.webhookCheckout =catchAsync(async (req, res, next) => {
  let event;
  const signature = req.headers['stripe-signature'];
  const stripe = Stripe(process.env.STRIPE_SECTRET);
  try { 
    console.log('test')
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error:${err.message}`);
  }
  console.log(event)
  if (event.type === 'checkout.session.completed')
   await createBookingCheckout(event.data.object);

  res.status(200).json({ received: true });
});
exports.createBooking = factory.createOne(booking);
exports.getBooking = factory.getOne(booking);
exports.updateBooking = factory.updateOne(booking);
exports.deleteBooking = factory.deleteOne(booking);
exports.getAllBooking = factory.getAll(booking);