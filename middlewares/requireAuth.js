const jwt = require("jsonwebtoken");
const Users = require("../schemas/Users");
const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;

  console.log("authorization:", authorization)

  if (!authorization) {
    return res.status(401).json({ error: " You are not authorized" });
  }

  const token = authorization.split(" ")[1];
  console.log("token:", token)
  try {
    console.log('jwt verify:', jwt.verify(token, process.env.SECRET))
    const { _id } = jwt.verify(token, process.env.SECRET);
    console.log('_id:', _id)
    req.user = await Users.findById(_id).select("_id");
    console.log("req.user:", req.user)
    next();
  } catch (error) {
    res.status(401).json({error});
  }
};
module.exports = requireAuth;
