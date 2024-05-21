const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require("../database/connect_database");

/**
 * Middleware function to authenticate JWT token.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @return {Object} The response object with appropriate status and message.
 */
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
  
  
  
  router.post("/login", async (req, res) => {
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
  router.post("/user", async (req, res) => {
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
  
  // Route to get all users (authenticated with JWT token)
  router.get("/loggedInUser", authenticateToken, async (req, res) => {
    const userId = req.user.userId; // Extract user ID from JWT token payload
  
    try {
      // Fetch all users and their ranks from the database
      const users = await db("user")
        .join("rank", "user.rank", "=", "rank.id")
        .select("user.id", "user.username", "user.email", "user.profile_picture", "rank.rank");
  
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

  module.exports = router;