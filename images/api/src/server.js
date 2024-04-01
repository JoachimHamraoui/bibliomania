require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const app = express();
const db = require("./database/connect_database");
// Middlewares
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());

app.get("/", (req,res ) =>{
    res.send("taboundimek")
  })

 

// Define a route for image upload
app.post('/upload', async (req, res) => {
  const {id, image_url, created_at, updated_at  } = req.body;

  try {
    await db('images').insert({
      id, image_url, created_at, updated_at
    })

    res.status(201).send({
      data: { id, image_url, created_at, updated_at },
      message: 'Added successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: 'Something went wrong',
      value: error
    });
  }
});


module.exports = app;