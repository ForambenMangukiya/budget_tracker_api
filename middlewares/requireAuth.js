const jwt = require("jsonwebtoken");
const Users = require("../schemas/Users");
const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  console.log("header:", req.headers)

  if (!authorization) {
    return res.status(401).json({ error: " You are not authorized" });
  }

  const token = authorization.split("")[1];
  try {
    const { _id } = jwt.verify(token, process.env.SECRET);
    req.user = await Users.findOne({ _id }).select("_id");
    next();
  } catch (error) {
    res.status(401).json({ error: "oupsss, appears you are not authorized" });
  }
};
module.exports = requireAuth;
