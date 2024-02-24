require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const app = express();

// Middlewares
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());


app.get("/", (req,res ) =>{
    res.send("taboundimek")
  })

module.exports = app;