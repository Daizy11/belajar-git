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
