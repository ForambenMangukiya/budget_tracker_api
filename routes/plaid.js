const express = require("express");

const {
    createLinkToken,
    setAccessToken,
    syncTransactions,
} = require("../controllers/plaid");

const api = express.Router();

// ROUTE : Get All Transactions and Create Transaction

api.post("/create_link_token/:_id", createLinkToken)
api.post("/set_access_token", setAccessToken)
api.get("/transactions/:id", syncTransactions)

module.exports = api;