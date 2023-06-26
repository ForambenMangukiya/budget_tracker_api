const express = require("express");
const requireAuth = require("../middlewares/requireAuth");

const {
  newTransaction,
  deleteTransaction,
  getAllTransaction,
  updateTransaction,
  deleteAllTransactions,
} = require("../controllers/transactions");

const api = express.Router();

api.use(requireAuth);

// ROUTE : Get All Transactions and Create Transaction
api
  .route("/")
  .get(getAllTransaction)
  .post(newTransaction)
  .delete(deleteAllTransactions);

// ROUTE : Delete One Transaction and Update One Transaction
api.route("/:id").delete(deleteTransaction).put(updateTransaction);

module.exports = api;
