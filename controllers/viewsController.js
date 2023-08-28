const Tour = require('../models/tourModels');
const catchAsync = require('../utils/catchAsync');
const user = require('../models/userModel')



exports.getOverview = catchAsync(async (req, res,next) => {
    try{
      const tours = await Tour.find()
      //2, Build Template
      //3, Render that tamplate using tour data from 1 
      
       res.status(200).render('overview', {
       title: 'The Forest Hiker Tour',
       tours
      //1. GEt Tour Data Form collection 
    });

    }catch(err){
      console.log(err)
    }
});

exports.getTour = catchAsync(async(req, res) => {
    // get the data, for requested tour (include review and guide )
  
    // const tour = factory.getOne({slug:req.params.slug},{path:'reviews',field:'review rating user'})
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
      path: 'reviews',
      fields: 'review rating user'
    });
    res.status(200).render('tour', {
      title: `${tour.name} tour`,
      tour
    });
})

exports.login = (req,res)=>{
  res.status(200).render('login', {
    title:"log into your account"
  });
}