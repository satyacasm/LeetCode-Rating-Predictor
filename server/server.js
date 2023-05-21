const express = require("express");
const app = express();
const mongoose=require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require("cors");
app.use(express.json());
app.use(cors());
require("dotenv").config();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const axios = require("axios");

const dbURI = process.env.DB_URI;
const port = process.env.PORT || 3001;

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
.then((res)=>console.log("Connected to MongoDB database"))
.catch((err)=>console.log("Error in connection to MongoDB"))

const adminRoutes = require('./routes/adminRoutes');

app.use('/admin',adminRoutes);



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
