const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

// Auth is verifying a certain user has the right to interact with a certain resource even if he is login in
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRED_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, //receive cookie,store it, send it automatically alomg every request
  };
  if (process.env.NODE_ENV === 'Production') cookieOption.secure = true;
  //remove password from the output
  user.password = undefined;

  res.cookie('jwt', token, cookieOption);

  res.status(statusCode).json({
    status: 'Success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
    passwordResetToken: req.body.passwordResetToken,
    passwordResetExpires: req.body.passwordResetExpires,
  });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1. Check password and email are exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  //2. Check the password and email are correct
  const user = await User.findOne({ email }).select('+password'); // + password will added password to the field but not by default

  if (!user || !(await user.correctPassword(password, user.password))) {
    //comapre postman password with in database password
    return next(new AppError('Incorrect email or password', 401));
  }
  //3. if everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // to protect the id and use the JWT
  //1. Getting token and check if it there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not log in, please log in to get access', 401)
    );
  }

  //2. Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); //seeing if the payload token has not been manipulated by some malicious third party

  //3. Check if user still exist
  const currentUser = await User.findById(decoded.id); // execute when the user has delete the field
  if (!currentUser) {
    return next(
      new AppError(
        'The token belonging to this token does no longer exist',
        401
      )
    );
  }
  //4. Check if user changed password after token was issues
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('user recently change password ! Please log in again', 401)
    );
  }

  // Grand Access to protect route
  req.user = currentUser; //put stuff on req.user can pass one middleware to another middleware
  next();
});
//only for rendered pages,no errors
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  
  if (req.cookies.jwt) {
    //1. Verification token
    const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET); //seeing if the payload token has not been manipulated by some malicious third party

    //2. Check if user still exist
    const currentUser = await User.findById(decoded.id); // execute when the user has delete the field
    if (!currentUser) {
      return next()
    }
    //3. Check if user changed password after token was issues
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next()
    }
    //each and every pug template will have access like render
    res.locals.user = currentUser
    //there is a loggin user
    // req.user = currentUser;
    return next()
  }

  // Grand Access to protect route
   //put stuff on req.user can pass one middleware to another middleware
  next();
});

exports.restrictTo = (...roles) => {
  //roles ['admin','lead-guide'].role = 'user'
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      ); //403 = forbidden response
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  console.log(user);
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  console.log('hashed token is...', hashedToken);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  console.log(req.body.passwordConfirm);
  await user.save();
  //3. Update changePasswordAt Property for the user

  //4.  log the user in,send the jwt
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1. get user from collection
  const user = await User.findById(req.user.id).select('+password');

  //2. check if posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Password is wrong', 401)); // 401 = unauthorized
  }
  //3. if so, update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save(); // why we dont use the findByIDAndUpdate? because on the passwordConfirm, there is a validator that only work for create and save
  // so findByIDAndUpdate wont save the current object in memory

  //4. log user in,send jwt
  createSendToken(user, 200, res);
});
