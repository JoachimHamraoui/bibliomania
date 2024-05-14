require("dotenv").config();
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require("express");
const cors = require("cors");
const app = express();
const db = require("./database/connect_database");
// Middlewares
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("taboundimek");
});


// TODO: Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.user = user;
    next();
  });
}



app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Retrieve user with the provided email from the database
    const user = await db("user").where({ username }).first();

    // If user is not found
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    // If passwords do not match
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // Token expires in 1 hour
    });

    // Send token in response
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: "Something went wrong",
      value: error,
    });
  }
});

// Route to add a user
app.post("/user", async (req, res) => {
  const { username, email, password, profile_picture, level, rank } = req.body;

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await db("user").insert({
      username,
      email,
      password: hashedPassword,
      profile_picture,
      level,
      rank,
    });

    res.status(201).send({
      data: newUser,
      message: "User created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: "Something went wrong",
      value: error,
    });
  }
});

// Route to add a group (authenticated with JWT token)
app.post("/group", authenticateToken, async (req, res) => {
  const {  name, image, description, code } = req.body;
  const userId = req.user.userId; // Extract user ID from JWT token payload
  console.log(req.user);

  try {
    // Insert the group into the database
    const newGroup = await db("group").insert({
      name,
      image,
      description,
      code,
      created_by: userId,
    });

    res.status(201).send({
      data: newGroup,
      message: userId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: "Something went wrong",
      value: error,
    });
  }
});
// Route to get all users (authenticated with JWT token)
app.get("/loggedInUser", authenticateToken, async (req, res) => {
  const userId = req.user.userId; // Extract user ID from JWT token payload

  try {
    // Fetch all users from the database
    const users = await db("user").select("*");

    // Find the data for the authenticated user
    const authenticatedUser = users.find(user => user.id === userId);

    if (!authenticatedUser) {
      return res.status(404).send({
        message: "User not found",
      });
    }

    res.status(200).send({
      allUsers: users,
      authenticatedUserData: authenticatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: "Something went wrong",
      value: error,
    });
  }
});


// Define a route for image upload
app.post("/upload", async (req, res) => {
  const { id, image_url, created_at, updated_at } = req.body;

  try {
    await db("images").insert({
      id,
      image_url,
      created_at,
      updated_at,
    });

    res.status(201).send({
      data: { id, image_url, created_at, updated_at },
      message: "Added successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: "Something went wrong",
      value: error,
    });
  }
});

module.exports = app;
