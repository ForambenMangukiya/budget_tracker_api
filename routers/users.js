const express = require("express");

const { newUser, updateUser, deleteOneUser } = require("../controllers/users");

const api = express.Router();

// TODOs:

// DEFAULT ROUTE   ---- PATH TO create a new user
// ("/").post(newUser);

api.route("/").post(newUser);
// Path to update or to delete user
api.route("/:_id").put(updateUser).delete(deleteOneUser);

module.exports = api;
