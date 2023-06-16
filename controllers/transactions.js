const Transaction = require("../schemas/Transactions");

// function newTransaction
  const newTransaction = async (req, res) => {
    try {
      const { category_name, tran_description, tran_amount, tran_sign, tran_currency, tran_date } = req.body;
      const user = req.user._id;
  
      const newTransaction = await Transaction.create({
        category_name, // HOUSE, TRANSPORTATION
        tran_description,
        tran_amount,
        tran_sign,   //DR (income) or CR(expense)
        tran_currency,
        tran_date,
        user,
      });
      res.status(201).json({success: true, data: newTransaction});
    } catch (error) {
      res.status(400).json({msg:error})
    }
  };

// function deleteTransaction
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req. params;
    const deletedTransaction = await Transaction.findByIdAndDelete(id);

    if (!deletedTransaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.status(200).json({success: true, data: deletedTransaction});
  } catch (error) {
    res.status(400).json({error})
  }
}

// function getAll Transactions for a user
const getAllTransaction = async (req, res) => {
  try {
    const user = req.user._id;
    console.log("req.user._id:", req.user._id)
    const transactions = await Transaction.find({ user });
    res.status(200).json(transactions);
    } catch (error) {
      res.status(400).json({msg:error})
  }
};

// function update Transaction
const updateTransaction= async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name,tran_description, tran_amount, tran_currency, tran_date } = req.body;
    const updatedTransaction = await Transaction.findByIdAndUpdate(id,
      {
        category_name,
        tran_description,
        tran_amount,
        tran_currency,
        tran_date,
      }
    );

  if (!updatedTransaction) {
    return res.status(404).json({ error });
  }

  res.status(200).json({success: true, data: updatedTransaction});
}
catch (error) {
  res.status(400).json({msg:error})
}
};

module.exports ={
  newTransaction,
  getAllTransaction,
  deleteTransaction, 
  updateTransaction,
};
