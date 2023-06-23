const Transaction = require("../schemas/Transactions");

// function newTransaction
const newTransaction = async (req, res) => {
  try {
    const {
      category_name,
      tran_description,
      tran_amount,
      tran_sign,
      tran_currency,
      tran_date,
      tran_id,
    } = req.body;
    const user = req.user._id;

    const newTransaction = await Transaction.create({
      category_name, // HOUSE, TRANSPORTATION
      tran_description,
      tran_amount,
      tran_sign, //DR (income) or CR(expense)
      tran_currency,
      tran_date,
      user,
      tran_id,
    });
    res.status(201).json({ success: true, data: newTransaction });
  } catch (error) {
    res.status(400).json({ msg: error });
  }
};

// function deleteTransaction
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTransaction = await Transaction.findByIdAndDelete(id);

    if (!deletedTransaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.status(200).json({ success: true, data: deletedTransaction });
  } catch (error) {
    res.status(400).json({ error });
  }
};

// function getAll Transactions for a user
const getAllTransaction = async (req, res) => {
  try {
    const { timeperiod } = req.query;
    const user = req.user._id;
    if (timeperiod === "all") {
      const user = req.user._id;
      const transactions = await Transaction.find({ user });
      res.status(200).json(transactions);
    } else {
      const user = req.user._id;
      let query = {};
      const currentDate = new Date();
      if (timeperiod === "month") {
        const startOfmonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        query = { user, tran_date: { $gte: startOfmonth, $lte: currentDate } };
      } else if (timeperiod === "3months") {
        const last3months = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 3,
          1
        );
        query = { user, tran_date: { $gte: last3months, $lte: currentDate } };
      } else if (timeperiod === "6months") {
        const last6months = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 6,
          1
        );
        query = { user, tran_date: { $gte: last6months, $lte: currentDate } };
      } else if (timeperiod === "year") {
        const startOfYear = new Date(currentDate.getFullYear(), 1, 1);
        query = { tran_date: { $gte: startOfYear, $lte: currentDate } };
      } else if (timeperiod === "week") {
        const lastWeek = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() - 7
        );
        const currentday = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate()
        );
        query = { user, tran_date: { $gte: lastWeek, $lte: currentday } };
      }
      console.log("req.user._id:", req.user._id);
      const transactions = await Transaction.find(query);
      res.status(200).json(transactions);
    }
  } catch (error) {
    res.status(400).json({ msg: error });
  }
};

// function update Transaction
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category_name,
      tran_description,
      tran_amount,
      tran_currency,
      tran_date,
      tran_id,
    } = req.body;
    const updatedTransaction = await Transaction.findByIdAndUpdate(id, {
      category_name,
      tran_description,
      tran_amount,
      tran_currency,
      tran_date,
      tran_id,
    });

    if (!updatedTransaction) {
      return res.status(404).json({ error });
    }

    res.status(200).json({ success: true, data: updatedTransaction });
  } catch (error) {
    res.status(400).json({ msg: error });
  }
};

module.exports = {
  newTransaction,
  getAllTransaction,
  deleteTransaction,
  updateTransaction,
};
