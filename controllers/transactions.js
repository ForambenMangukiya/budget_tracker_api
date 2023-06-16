//TODOs:
const Transaction = require("../schemas/Transactions");

// function newTransaction
  const newTransaction = async (req, res) => {
    console.log("request:", req.user.id)
    try {
      const { category_name, tran_description, tran_amount, tran_sign, tran_currency, tran_date } = req.body;
  
      const newTransaction = await Transaction.create({
        category_name, // HOUSE, TRANSPORTATION
        tran_description,
        tran_amount,
        tran_sign,   //DR (income) or CR(expense)
        tran_currency,
        tran_date,
        user,
      });
  
      res.status(201).json(newTransaction);
    } catch (error) {
      res.status(400).json({msg:error})
    }
  };

// function deleteTransaction
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req. params;
    const deletedTransaction = await Transaction.findByIdAndDelete({ _id: id });

    if (!deletedTransaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.status(200).json(deletedTransaction);
  } catch (error) {
    res.status(400).json({msg:error})
  }
}

// function getAll Transactions for a user
const getAllTransaction = async (req, res) => {
  try {
    const user = req.user;
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
    const { category_name,tran_description, tran_amount, tran_sign, tran_currency, tran_date } = req.body;
    const existingTrans = await Transaction.findById(id)

    const updatedTransaction = await Transaction.findByIdAndUpdate(id,
      {
        category_name: category_name,
        tran_description: tran_description,
        tran_amount: tran_amount,
        tran_currency: tran_currency,
        tran_date: tran_date,
      }
    );

  if (!updatedTransaction) {
    return res.status(404).json({success: false });
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
