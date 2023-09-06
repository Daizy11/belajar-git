const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require("../utils/appError")
const factory = require('./handleFactory')

const filterObj = (obj,...allowedFields)=>{
  const newObj = {}
  Object.keys(obj).forEach(el =>{
    if(allowedFields.includes(el)) newObj[el] = obj[el]
  })
  return newObj
}

exports.updateMe = catchAsync( async (req,res,next)=>{
  //1. Create user if user POST password data
  if(req.body.password||req.body.passwordConfirm){
    next(new AppError('This route is not for user password update.Please use /updateMYpassword '),400)
  }
  //2. Filtered out unwanted fields names that are not allowed to be updated
  const filterBody = filterObj(req.body,'name','email')
  
  //3. Update user document 
  const updatedUser = await User.findByIdAndUpdate(req.user.id,filterBody,{new:true,runValidators:true}) //why we can use findByIdAndUpdate now? cause we are not dealing with password,we are dealing with non-sensitive data like name,email,etc
  
  res.status(200).json({
    status : "Success",
    data:{
      user : updatedUser
    }

  })
})

exports.deleteMe = catchAsync(async(req,res,next)=>{
  await User.findByIdAndUpdate(req.user.id,{active:false}) //only work for loggin user, and so the user ID conviniently stored at request 
  res.status(204).json({
    status:'Status',
    data:null
  })
})
const AppError = require('../utils/appError');
const factory = require('./handleFactory');
const multer = require('multer');
const sharp = require('sharp')

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user${req.user.id}-${Date.now()}.${ext}`);
//   },
// });
const multerStorage = multer.memoryStorage()
//if u want to resize, save file into memory not into disk
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto =  async (req,file,next)=>{
  if(!req.file){
    return next()
  }

  req.file.filename = `user${req.user.id}-${Date.now()}.jpeg` //save file into db
 await sharp(req.file.buffer).resize(500,500).toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/users/${req.file.filename}`) //after uploading file, its better to not save file in the disk instead save in memory
  next()
  // sharp is Node.js module is to convert large images in common formats to smaller, web-friendly JPEG, PNG, WebP, GIF and AVIF images of varying dimensions.
}



exports.updateMe = catchAsync(async (req, res, next) => {

  //1. Create user if user POST password data
  if (req.body.password || req.body.passwordConfirm) {
    next(
      new AppError(
        'This route is not for user password update.Please use /updateMYpassword '
      ),
      400
    );
  }
  //2. Filtered out unwanted fields names that are not allowed to be updated
  const filterBody = filterObj(req.body, 'name', 'email');
  if(req.file) filterBody.photo = req.file.filename //add photo into filterbody
  //3. Update user document

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  }); //why we can use findByIdAndUpdate now? cause we are not dealing with password,we are dealing with non-sensitive data like name,email,etc
  console.log(updatedUser)
  res.status(200).json({
    status: 'Success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false }); //only work for loggin user, and so the user ID conviniently stored at request
  res.status(204).json({
    status: 'Status',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!, Please use signup instead'
  }); //500 means internal server error
};

exports.getMe = (req,res,next)=>{
  req.params.id = req.user.id

  next()
}

exports.getAllUsers =factory.getAll(User)
exports.getUsers = factory.getOne(User)
//do not change password
exports.updateUser = factory.updateOne(User)

exports.deleteUser = factory.deleteOne(User)
    message: 'This route is not yet defined!, Please use signup instead',
   //500 means internal server error


exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;

  next();
};

exports.getAllUsers = factory.getAll(User);
exports.getUsers = factory.getOne(User);
//do not change password
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
