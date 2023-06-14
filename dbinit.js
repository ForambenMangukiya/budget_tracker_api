const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.ATLAS_URI);
    console.log(`Connected to mongoDB: ${conn.connection.name}`.bgYellow);
  } catch (error) {
    console.log(error);
  }
};
module.exports = connectDB;
