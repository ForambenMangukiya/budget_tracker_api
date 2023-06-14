const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require("./dbinit");
const PORT = process.env.PORT || 8080;
require("colors");
require("dotenv").config();
connectDB();

// middlewears
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("welcome to our Badget tracker API ");
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`.america);
});
