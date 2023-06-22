const port = process.env.PORT || 3000;
const fs = require('fs');
const dotenv = require('dotenv'); //environtment is not related to express, so we make it outside of app.js
const mongoose = require('mongoose');
const Tour = require('./../../models/tourModels');
// console.log(app.get('env')); environtment is set by node and js itself globally
dotenv.config({ path: './config.env' });
// console.log(process.env)
const db = process.env.DATABASE;
mongoose
  .connect(db, {
    useNewUrlParser: true //its just some option in order to deal with deprecation warning
  })
  .then(() => console.log('Connection succesfull'));

// Read JSON FIle
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

//import data to db
const importDt = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//Delete all data from collection
const deleteDt = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data deleted!');
} catch (err) {
    console.log(err);
}
process.exit();
};
console.log(process.argv);

if (process.argv[2] === '--import') {
  importDt();
} else if (process.argv[2] === '--delete') {
  deleteDt();
}
