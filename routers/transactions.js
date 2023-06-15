//TODOs:
const express = require("express");
const {
  newTransaction,
  deleteTransaction,
  getAllTransaction,
  updateTransaction,
} = require("../controllers/transactions");

const api = express.Router();

// ("/").post(newTransaction);
api.route("/").post(newTransaction);

// ("/delete/:txn_id").delete(deleteTransaction)
api.route("/delete/:txn_id").delete(deleteTransaction);

// ("/transactions").get(getAllTransaction)
api.route("/transactions").get(getAllTransaction);

// ("/update/:txn_id").put(updateTransaction)
api.route("/update/:txn_id").put(updateTransaction);

module.exports = api;
