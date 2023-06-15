const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  category_name: {
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
    type: String,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "Users",
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);
