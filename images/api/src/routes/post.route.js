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


router.post("/user", async (req, res) => {
    const { username, email, password, profile_picture, level, rank } = req.body;

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
  router.post("/group", authenticateToken, async (req, res) => {
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
  
  // Route to add a book to a group
  router.post("/group/:groupId/book", authenticateToken, async (req, res) => {
    const { title, author, description, cover } = req.body;
    const { groupId } = req.params;
  
    try {
      // Check if the group exists
      const group = await db('group').where({ id: groupId }).first();
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
  
      // Insert the book into the database
      const newBook = await db('book').insert({
        title,
        author,
        description,
        cover,
        group: groupId, // Foreign key to the group
      }).returning('*'); // Returning the inserted book
  
      res.status(201).send({
        data: newBook,
        message: "Book added to group successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        error: "Something went wrong",
        value: error,
      });
    }
  });
  
  // Route to add a question for a specific book
  router.post("/book/:bookId/question", authenticateToken, async (req, res) => {
    const { question } = req.body;
    const { bookId } = req.params;
  
    try {
      // Check if the book exists
      const book = await db('book').where({ id: bookId }).first();
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
  
      // Insert the question into the database
      const newQuestion = await db('question').insert({
        question_about: bookId, // Foreign key to the book
        question,
      }).returning('*'); // Returning the inserted question
  
      res.status(201).send({
        data: newQuestion,
        message: "Question added to book successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        error: "Something went wrong",
        value: error,
      });
    }
  });
  
  // Route to add an option to a specific question
  router.post("/question/:questionId/option", authenticateToken, async (req, res) => {
    const { option } = req.body;
    const { questionId } = req.params;
  
    try {
      // Check if the question exists
      const question = await db('question').where({ id: questionId }).first();
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
  
      // Insert the option into the database
      const newOption = await db('question_option').insert({
        question_id: questionId, // Foreign key to the question
        option,
      }).returning('*'); // Returning the inserted option
  
      res.status(201).send({
        data: newOption,
        message: "Option added to question successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        error: "Something went wrong",
        value: error,
      });
    }
  });
  
  // Route to add an entry to the user_book table
  router.post("/user/book", authenticateToken, async (req, res) => {
    const { book_id, group_id, user_id } = req.body;
    // const user_id = req.user.userId; // Extract user ID from JWT token payload
  
    try {
      // Insert the entry into the user_book table
      const newUserBookEntry = await db('user_book').insert({
        user_id,
        book_id,
        group_id,
        liked: false,
        read: false
      }).returning('*'); // Returning the inserted entry
  
      res.status(201).send({
        data: newUserBookEntry,
        message: "Entry added to user_book successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        error: "Something went wrong",
        value: error,
      });
    }
  });

  router.post("/user/group", authenticateToken, async (req, res) => {
    const { group_id, code } = req.body;
    const user_id = req.user.userId; // Extract user ID from JWT token payload
  
    try {
      // Check if the group exists and if the code matches
      const group = await db('group').where({ id: group_id }).first();
  
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
  
      if (group.code !== code) {
        return res.status(400).json({ message: "Invalid code" });
      }
  
      // Insert the entry into the user_group table
      const newUserGroupEntry = await db('user_group').insert({
        user_id,
        group_id
      }).returning('*'); // Returning the inserted entry
  
      res.status(201).send({
        data: newUserGroupEntry,
        message: "User added to group successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        error: "Something went wrong",
        value: error,
      });
    }
  });

  router.post("/user/answer", authenticateToken, async (req, res) => {
    const { question_id, chosen_option_id } = req.body;
    const user_id = req.user.userId; // Extract user ID from JWT token payload
  
    try {
      // Insert the entry into the user_answer table
      const newUserAnswerEntry = await db('user_answer').insert({
        user_id,
        question_id,
        chosen_option_id
      }).returning('*'); // Returning the inserted entry
  
      res.status(201).send({
        data: newUserAnswerEntry,
        message: "Answer submitted successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        error: "Something went wrong",
        value: error,
      });
    }
  });

  router.post("/book/comment", authenticateToken, async (req, res) => {
    const { group_id, book_id, comment, image } = req.body;
    const user_id = req.user.userId; // Extract user ID from JWT token payload
  
    try {
      // Insert the entry into the book_comments table
      const newBookCommentEntry = await db('book_comments').insert({
        user_id,
        group_id,
        book_id,
        comment,
        image: image || null
      }).returning('*'); // Returning the inserted entry
  
      res.status(201).send({
        data: newBookCommentEntry,
        message: "Comment added successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        error: "Something went wrong",
        value: error,
      });
    }
  });
  
  router.post("/vote", authenticateToken, async (req, res) => {
    const { group_id } = req.body;
    const ended = false; // Default value for ended column
  
    try {
      // Insert the entry into the votes table
      const newVoteEntry = await db('vote').insert({
        group_id,
        ended
      }).returning('*'); // Returning the inserted entry
  
      res.status(201).send({
        data: newVoteEntry,
        message: "Vote created successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        error: "Something went wrong",
        value: error,
      });
    }
  });

  router.post("/vote/group/book", authenticateToken, async (req, res) => {
    const { group_id, book_id, vote_id } = req.body;
    const user_id = req.user.userId; // Extract user ID from JWT token payload
  
    try {
      // Insert the entry into the vote_group_book table
      const newVoteGroupBookEntry = await db('vote_group_book').insert({
        user_id,
        group_id,
        book_id,
        vote_id
      }).returning('*'); // Returning the inserted entry
  
      res.status(201).send({
        data: newVoteGroupBookEntry,
        message: "Vote group book entry created successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        error: "Something went wrong",
        value: error,
      });
    }
  });
  
  router.post("/group/book/history", authenticateToken, async (req, res) => {
    const { group_id, book_id } = req.body;
    const completed = false; // Default value for completed column
  
    try {
      // Insert the entry into the group_book_history table
      const newGroupBookHistoryEntry = await db('group_book_history').insert({
        group_id,
        book_id,
        completed
      }).returning('*'); // Returning the inserted entry
  
      res.status(201).send({
        data: newGroupBookHistoryEntry,
        message: "Group book history entry created successfully",
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