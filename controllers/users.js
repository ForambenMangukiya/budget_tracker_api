const Users = require("../schemas/Users");
const jwt = require("jsonwebtoken");

const createToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET, { expiresIn: "1d" });
};
//TODOs:

// login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Users.login(email, password);
    const token = createToken(user._id);
    res.status(200).json({ email, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//signup user

const signupUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Users.signup(email, password);
    const token = createToken(user._id);
    res.status(200).json({ email, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// function newUser
//  --- ADD USER
const newUser = async (req, res) => {
  try {
    console.log("body:", req.body);
    const { first_name, last_name, user_name, email, password } = req.body;
    const user = await Users.findOne({ email: email });
    if (user) {
      res.status(409).json({
        success: false,
        msg: "Email already exists , try another one",
      });
    } else {
      const user = await Users.create({
        first_name,
        last_name,
        user_name,
        email,
        password,
      });
      res.status(201).json({
        success: true,
        msg: "Registration completed",
        data: user,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error,
    });
  }
};

// function updateUser

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, user_name, email, password } = req.body;
    const user = await Users.findByIdAndUpdate(id, {
      first_name,
      last_name,
      email,
      password,
    });
    if (!user) {
      res.status(404).json({ success: false, msg: " i don't know this user " });
    } else
      res
        .status(200)
        .json({ success: true, msg: "your user has been updated", data: user });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};

// function deleteUser

const deleteOneUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Users.findByIdAndDelete(id);
    if (!user) {
      res.status(404).json({ success: false, msg: "i don't know this user " });
    } else {
      res
        .status(200)
        .json({ success: true, msg: "your user has been deleted", data: user });
    }
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
};

module.exports = {
  loginUser,
  signupUser,
  newUser,
  updateUser,
  deleteOneUser,
};
