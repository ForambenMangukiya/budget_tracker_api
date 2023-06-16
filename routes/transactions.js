const express = require("express");
const requireAuth = require("../middlewares/requireAuth")

const {
  newTransaction,
  deleteTransaction,
  getAllTransaction,
  updateTransaction,
} = require("../controllers/transactions");

const api = express.Router();

api.use(requireAuth);

// ("/").post(newTransaction);
// api.route("/new").post(newTransaction);
api.route("/new").post(newTransaction);

// ("/delete/:txn_id").delete(deleteTransaction)
api.route("/delete/:txn_id").delete(deleteTransaction);

// ("/transactions").get(getAllTransaction)
api.route("/").get(getAllTransaction);

// ("/update/:txn_id").put(updateTransaction)
api.route("/update/:txn_id").put(updateTransaction);

module.exports = api;
