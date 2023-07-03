require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require("./dbinit");
const PORT = process.env.PORT || 8080;

// ---------------------------------------------------------------------
const bodyParser = require("body-parser");
const { Configuration, PlaidEnvironments, PlaidApi } = require("plaid");

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || "sandbox";
const PLAID_PRODUCTS = (
  process.env.PLAID_PRODUCTS || "auth,transactions"
).split(",");

const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || "DE").split(
  ","
);
const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || "";
const RECORDING_MODE = process.env.RECORDING_MODE || false
// TODO: save the following to mongoDB user!!!!
let ACCESS_TOKEN = null;
let PUBLIC_TOKEN = null;
let ITEM_ID = null;
let PAYMENT_ID = null;
let TRANSFER_ID = null;

const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": PLAID_CLIENT_ID,
      "PLAID-SECRET": PLAID_SECRET,
      "Plaid-Version": "2020-09-14",
    },
  },
});

const client = new PlaidApi(configuration);

//------------------------------------------------------------------------------------

const userRoutes = require("./routes/users");
const transactionRoutes = require("./routes/transactions");
const upload = require("./routes/upload");

require("colors");
connectDB();

// middlewears
app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/users", userRoutes);
app.use("/transaction", transactionRoutes);
app.use("/api", upload);

app.get("/", (req, res) => {
  res.send("welcome to our Badget tracker API ");
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`.america);
});









//======================================================================================
// Create a link token with configs which we can then use to initialize Plaid Link client-side.

app.post("/api/create_link_token/:_id", async function (req, res) {
  const { _id } = req.params;
  // console.log("req.user:", req.user)
  // const _id = req.user._id;
  // const _id = "648c93d4994cb7768eaecbd9";
  const configs = {
    user: {
      // This should correspond to a unique id for the current user.
      client_user_id: _id,
    },
    client_name: "Plaid Test App",
    products: ["transactions","auth"],
    language: "en",
    webhook: "https://webhook.example.com",
    country_codes: ["DE"],
  };
  try {
    const createTokenResponse = await client.linkTokenCreate(configs);
    res.status(200).json(createTokenResponse.data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Exchange token flow - exchange a Link public_token for an API access_token
app.post("/api/set_access_token", async function (req, res, next) {
  PUBLIC_TOKEN = req.body.public_token;
  console.log("PUBLIC_TOKEN", PUBLIC_TOKEN);
  try {
    const tokenResponse = await client.itemPublicTokenExchange({
      public_token: PUBLIC_TOKEN,
    });

    ACCESS_TOKEN = tokenResponse.data.access_token;
    ITEM_ID = tokenResponse.data.item_id;
    console.log(">>>>ITEM_ID", ITEM_ID);
    console.log(">>>>ACCESS_TOKEN", ACCESS_TOKEN);
    // if (PLAID_PRODUCTS.includes(Products.Transfer)) {
    //     const TRANSFER_ID = await authorizeAndCreateTransfer(ACCESS_TOKEN);
    // }
    res.status(200).json({
      // the 'access_token' is a private token, DO NOT pass this token to the frontend in your production environment
      // access_token: ACCESS_TOKEN,   // TODO: remove this later!!!!
      item_id: ITEM_ID,
      message: "Public token exchange is successful",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Retrieve Transactions for an Item
app.get("/api/transactions/:id", async function (req, res, next) {
  console.log(">>>>ACCESS TOKEN:", ACCESS_TOKEN)
  const { id } = req.params;
  try {
    // Set cursor to empty to receive all historical updates
    let cursor = null;

    // New transaction updates since "cursor"
    let added = [];
    let modified = [];
    // Removed transaction ids
    let removed = [];
    let hasMore = true;

    // Iterate through each page of new transaction updates for item
    while (hasMore) {
      const request = {
        access_token: ACCESS_TOKEN,
        cursor: cursor,
      };

      // const response = await fetchTransactionsFromPlaid();
      // const data = response.data;

      let data
      console.log("recording mode?", {RECORDING_MODE})
      if (RECORDING_MODE) {
        console.log("recording is starting", id)
        data = getStaticPlaidTransactions()
      } else {
        data = await fetchTransactionsFromPlaid()
      }

      // console.log("trans:", data);
      // Add this page of results
      added = added.concat(data.added);
      modified = modified.concat(data.modified);
      removed = removed.concat(data.removed);
      hasMore = data.has_more;
      // Update cursor to the next cursor
      cursor = data.next_cursor;
    }


    const compareTxnsByDateAscending = (a, b) =>
      (a.date > b.date) - (a.date < b.date);
    // Return the 8 most recent transactions
    const recently_added = [...added]
      .sort(compareTxnsByDateAscending)
      .slice(-5);
    console.log("ALL added:", added )
    console.log(">>>>ACCESS_TOKEN", ACCESS_TOKEN);  

    // recently_added.map(async addedTransaction => {
    added.map(async addedTransaction => {
      const newTransaction = getTransactionFromImportedTxn(addedTransaction, id)
      newTransaction.category_name = mapCategoryFromBank(addedTransaction.category)
      await updateOrInsertTxn(newTransaction)  
    })
    console.log(">>>>ACCESS_TOKEN", ACCESS_TOKEN);
    res.status(200).json({ all_transactions: added });
    // res.status(200).json({ latest_transactions: recently_added });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const Transaction = require("./schemas/Transactions");

async function fetchTransactionsFromPlaid() {
  Promise.resolve().then(async () => {
    const SLEEP_TIME = 10000;
    const MAX_RETRY = 3;

    var retries = MAX_RETRY;
    while (retries > 0) {
      console.log(
        "INFO: inside retryer function, retries remaining=",
        retries
      );

      try {
        const response = await client.transactionsSync(request);
        if (response.data.added.length > 0) {
          console.log("INFO: success! found non-zero array!");
          return response.data;
        }
        console.log(
          "WARNING: transactionsSync returned ok but had empty array!"
        );
      } catch (e) {
        console.log("ERROR: transactionsSync failed:", e);
      }

      console.log("INFO: sleeping before next retry...");
      await new Promise((resolve) => {
        setTimeout((_) => {
          resolve();
        }, SLEEP_TIME); // sleep for N seconds
      });

      console.log("INFO: ...woken up; trying again");
      retries = retries - 1;
    }
  })
};

async function updateOrInsertTxn(newTransaction) {
  const foundTxn = await findTransactionByTranID(newTransaction.tran_id)
  if (foundTxn == null){
    insertTransaction(newTransaction)
    return
  }
  updateTransaction(newTransaction)
}

async function findTransactionByTranID(tranID){
  try {
    const foundTransaction = await Transaction.findOne({ tran_id: tranID });
    if (!foundTransaction) {
      console.log('Transaction_ID not found');
      return null;
    }
    console.log('Found transaction_ID:', foundTransaction);
  } catch (error) {
    console.error('Error finding transaction_ID:', error);
  }
}

async function updateTransaction(newTransaction){
  try {
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { tran_id: newTransaction.tran_id }, // Query to find the document by its ID
      { $set: newTransaction }, // Updated data to be applied using the $set operator
      { new: true } // Options: returns the modified document after update
    );

    if (!updatedTransaction) {
      console.log('Transaction not found');
      return;
    }
    console.log('Transaction updated:', updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
  }
}

async function insertTransaction(newTransaction){
  try {
    const newTran = await Transaction.create(newTransaction);
    console.log("OK: inserted a new txn!", newTran)
  } catch (error) {
    console.error('Error adding transaction:', error);
  }  
}


function mapCategoryFromBank(category){
  if (category.length == 0) {
    return "others"
  }
  console.log("plaid category:", category)
  // TODO lowercase the category
  const lowercasedCategory = category[0]

  switch (lowercasedCategory){
  case "Food and Drink":
    return "eatingout"
  case "Travel":
    return "transport"  
  case "Payment":
    return "bills" 
  default:
    return category[0]
  }
}

function getTransactionFromImportedTxn(importedTxn, id) {
  const txn = {
      category_name: importedTxn.category,
      tran_description: importedTxn.name,
      tran_amount: importedTxn.amount,
      tran_sign: importedTxn.tran_sign ? importedTxn.tran_sign : "DR", 
      tran_currency: importedTxn.tran_currency ? importedTxn.tran_currency : "DE", 
      tran_date: importedTxn.authorized_date,
      user: id, 
      tran_id: importedTxn.transaction_id,
  }
  return txn
}

function getStaticPlaidTransactions(){
  console.log("getStaticPlaidTransactions()")
  data = {
    added: [
      {
        category: ["medicine", "health"],
        name: "KOENIGIN LUISE APOTHEK/BERLIN/DE",
        amount: 26.37, 
        tran_sign: "DR", 
        tran_currency: "DE",
        authorized_date: "2023-06-16T00:00:00.000Z",
        transaction_id: "4673956022",
      },
      {
        category: ["deposits", "transfer"],
        name: "SEPA-Payment Transfer",
        amount: 400.00, 
        tran_sign: "CR", 
        tran_currency: "DE",
        authorized_date: "2023-06-29T00:00:00.000Z",
        transaction_id: "21005000",
      },
      {
        category: ["work", "shopping"],
        name: "AMZN Mktp DE.H21I86JR5//800-279-6620/LU",
        amount: 22.58, 
        tran_sign: "DR", 
        tran_currency: "DE",
        authorized_date: "2023-06-15T00:00:00.000Z",
        transaction_id: "AZxVGdvjJxtwREJjnKWAspNwLR5WMau9D4A3V",
      },
      {
        category: ["savings", "transfer"],
        name: "SEPA-Payment Transfer",
        amount: 200.00, 
        tran_sign: "CR", 
        tran_currency: "DE",
        authorized_date: "2023-06-14T00:00:00.000Z",
        transaction_id: "rGgDae4bvgS9LyjwoGxZIv9mpag1Wlc74d6No",
      },
      {
        category: ["communication", "bills"],
        name: "Gebuehr fuer o2 my Prepaid S fuer Ihr Prepaid-Konto",
        amount: 9.99, 
        tran_sign: "DR", 
        tran_currency: "DE",
        authorized_date: "2023-06-09T00:00:00.000Z",
        transaction_id: "W7LMQber3Liz9JQwEk46CqMAy4gGRwU68P1q5",
      },
      {
        category: ["insurance", "health"],
        name: "SEPA-Direct Debit Feather by Stripe via PPRO",
        amount: 9.00, 
        tran_sign: "DR", 
        tran_currency: "DE",
        authorized_date: "2023-06-06T00:00:00.000Z",
        transaction_id: "13005000",
      },
    ],
    modified: [],
    removed: [],
    hasMore: false,
    next_cursor: null
  }
  console.log("EXITING getStaticPlaidTransactions", data)
  return data
}

