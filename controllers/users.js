const Users = require("../schemas/Users");
const jwt = require("jsonwebtoken");

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "1d" });
};


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
  console.log("body:", req.body);
  const access_token = "";
  const { first_name, last_name, email, password, country_code, } = req.body;

  try {
    const user = await Users.signup(first_name, last_name, email, password, country_code, access_token,);
    const token = createToken(user._id);
    res.status(200).json({ email, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// function updateUser

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, password, country_code, access_token, 
      budgets: [{ category_name, budget_description, limit_amount, budget_date}]  } = req.body;
    const user = await Users.findByIdAndUpdate(id, {
      first_name,
      last_name,
      email,
      password,
      country_code,
      access_token,
      budgets: [
        {
          category_name,
          budget_description,
          limit_amount,
          budget_date,
        }]
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
  updateUser,
  deleteOneUser,
};
