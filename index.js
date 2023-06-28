const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./dbinit");
const PORT = process.env.PORT || 8080;

// ---------------------------------------------------------------------
const util = require("util");
const bodyParser = require("body-parser");
const moment = require("moment");
const { Configuration, PlaidEnvironments, PlaidApi } = require("plaid");

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || "sandbox";
const PLAID_PRODUCTS = (
  process.env.PLAID_PRODUCTS || Products.Transactions
).split(",");

const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || "DE").split(
  ","
);
const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || "";
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

app.get("/", (req, res) => {
  res.send("welcome to our Badget tracker API ");
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`.america);
});

//======================================================================================
// Create a link token with configs which we can then use to initialize Plaid Link client-side.

app.post("/api/create_link_token", async function (req, res) {
  const _id = "648c93d4994cb7768eaecbd9";
  const configs = {
    user: {
      // This should correspond to a unique id for the current user.
      client_user_id: _id,
    },
    client_name: "Plaid Test App",
    products: ["auth"],
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
  console.log("req.body", req.body);
  PUBLIC_TOKEN = req.body.public_token;
  console.log("PUBLIC_TOKEN", PUBLIC_TOKEN);
  try {
    const tokenResponse = await client.itemPublicTokenExchange({
      public_token: PUBLIC_TOKEN,
    });

    ACCESS_TOKEN = tokenResponse.data.access_token;
    ITEM_ID = tokenResponse.data.item_id;
    console.log(">>>>ACCESS_TOKEN", ACCESS_TOKEN);
    console.log(">>>>ITEM_ID", ITEM_ID);
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
app.get("/api/transactions", async function (req, res, next) {
  try {
    console.log("Access Token to Get Txns", ACCESS_TOKEN);
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

      const getTransactions = async () =>
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
                return response;
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
        });

      const response = await getTransactions();
      const data = response.data;
      console.log("trans:", data);
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
      .slice(-8);
    res.status(200).json({ latest_transactions: recently_added });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
