const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

//Schema for the user
const usersSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: { type: String, required: true },
});

// creating a custom static method

usersSchema.statics.signup = async function (first_name, last_name, email, password) {
  //check the existing of the user

  const exists = await this.findOne({ email });
  if (exists) {
    throw Error("email already in use");
  }

  // checking if the user inserted both email and password

  if (!email || !password) {
    throw Error("please fill all fields");
  }
  if (!validator.isEmail(email)) {
    throw Error("email is not valid");
  }
  //validating the password
  if (!validator.isStrongPassword(password)) {
    throw Error(
      "make sure to use at least 8 charachters, one uppercase,one lower case, anumber and a symbol"
    );
  }
  //encrypt password
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  //create user
  const user = await this.create({ first_name, last_name, email, password: hash });
  return user;
};

//static custon login method
usersSchema.statics.login = async function (email, password) {
  //check that i have both field email and password
  if (!email || !password) {
    throw Error("please fill all fields");
  }
  //check if the email is correct
  const user = await this.findOne({ email });
  if (!user) {
    throw Error("incorrect email");
  }
  //check the password
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw Error("incorrect password");
  }
  return user;
};
module.exports = mongoose.model("Users", usersSchema);
