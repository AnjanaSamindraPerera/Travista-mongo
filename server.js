const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");

//require screams route

const screams = require("./routes/screams");
const users = require("./routes/user");

require("dotenv").config();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.ATLAS_URI;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
});

const connection = mongoose.connection;

connection.once("open", () => {
  console.log("MongoDB database connection established succesfully");
});

app.use("/screams", screams);
app.use("/user", users);

app.listen(PORT, console.log(`server starts on ${PORT}`));
