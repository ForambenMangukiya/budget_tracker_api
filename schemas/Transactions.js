const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  category_name: {
    type: String,
  },
  tran_description: {
    type: String,
  },
  tran_amount: {
    type: String,
  },
  tran_sign: {
    type: String,
  },
  tran_currency: {
    type: String,
  },
  tran_date: {
    type: Date,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
  tran_id: {
    type: String,
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);
