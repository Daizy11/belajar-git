const port = process.env.PORT || 3000;
const dotenv = require('dotenv'); //environtment is not related to express, so we make it outside of app.js
const mongoose = require('mongoose');
const app = require('./app');
// console.log(app.get('env')); environtment is set by node and js itself globally
dotenv.config({ path: './config.env' });
// console.log(process.env)
const db = process.env.DATABASE;
mongoose
  .connect(db, {
    useNewUrlParser: true, //its just some option in order to deal with deprecation warning
  })
  .then(() => console.log('Connection succesfull'));

// const testTour = new Tour({
//   name: "The Forest Hiker",
//   rating: 4.7,
//   prices: 497
// });
// testTour
//   .save()
//   .then(doc => {
//     console.log(doc);
//   })
//   .catch(err => console.log(err));
console.log(process.env.NODE_ENV);
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
// config.env is for set the environtment, so we shouldn't have to write on terminal one by one
//
