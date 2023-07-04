require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require("./dbinit");
const PORT = process.env.PORT || 8080;

// ---------------------------------------------------------------------
const bodyParser = require("body-parser");
// const { Configuration, PlaidEnvironments, PlaidApi } = require("plaid");

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

// const configuration = new Configuration({
//   basePath: PlaidEnvironments[PLAID_ENV],
//   baseOptions: {
//     headers: {
//       "PLAID-CLIENT-ID": PLAID_CLIENT_ID,
//       "PLAID-SECRET": PLAID_SECRET,
//       "Plaid-Version": "2020-09-14",
//     },
//   },
// });

// const client = new PlaidApi(configuration);

const userRoutes = require("./routes/users");
const transactionRoutes = require("./routes/transactions");
const upload = require("./routes/upload");
const plaid = require("./routes/plaid");

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
app.use("/api", plaid);

app.get("/", (req, res) => {
  res.send("welcome to our Badget tracker API ");
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`.america);
});
