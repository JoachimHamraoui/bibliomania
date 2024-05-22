const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const moment = require('moment');
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

router.patch("/update-level", authenticateToken, async (req, res) => {
    const userId = req.user.userId; // Extract user ID from JWT token payload

    try {
        // Fetch the current level and rank of the user
        const user = await db('user')
            .where('id', userId)
            .first('level', 'rank');

        if (!user) {
            return res.status(404).send({
                message: "User not found",
            });
        }

        // Increment the user's level by 1
        const newLevel = user.level + 1;

        // Determine if rank needs to be incremented
        let newRank = user.rank;
        if (newLevel % 10 === 0) {
            newRank += 1;
        }

        // Update the user's level and rank in the database
        await db('user')
            .where('id', userId)
            .update({
                level: newLevel,
                rank: newRank,
            });

        res.status(200).send({
            message: "User level and rank updated successfully",
            newLevel,
            newRank,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: "Something went wrong",
            value: error,
        });
    }
});

router.patch("/update-profile-picture", authenticateToken, async (req, res) => {
    const userId = req.user.userId; // Extract user ID from JWT token payload
    const { profile_picture } = req.body; // Extract profile picture URL from request body

    if (!profile_picture) {
        return res.status(400).send({
            message: "Profile picture URL is required",
        });
    }

    try {
        // Update the user's profile picture in the database
        await db('user')
            .where('id', userId)
            .update({
                profile_picture: profile_picture,
            });

        res.status(200).send({
            message: "User profile picture updated successfully",
            profile_picture: profile_picture,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: "Something went wrong",
            value: error,
        });
    }
});

router.patch("/update-bio", authenticateToken, async (req, res) => {
    const userId = req.user.userId; // Extract user ID from JWT token payload
    const { bio } = req.body; // Extract bio from request body

    if (!bio) {
        return res.status(400).send({
            message: "Bio is required",
        });
    }

    try {
        // Update the user's bio in the database
        await db('user')
            .where('id', userId)
            .update({
                bio: bio,
            });

        res.status(200).send({
            message: "User bio updated successfully",
            bio: bio,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: "Something went wrong",
            value: error,
        });
    }
});

router.patch("/update-liked", authenticateToken, async (req, res) => {
    const userId = req.user.userId; // Extract user ID from JWT token payload
    const { book_id, group_id, liked } = req.body; // Extract book ID, group ID, and liked status from request body

    if (liked === undefined) {
        return res.status(400).send({
            message: "Liked status is required",
        });
    }

    try {
        // Update the 'liked' column in the user_book table
        await db('user_book')
            .where({
                user_id: userId,
                book_id: book_id,
                group_id: group_id
            })
            .update({
                liked: liked,
            });

        res.status(200).send({
            message: "User book liked status updated successfully",
            liked: liked,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: "Something went wrong",
            value: error,
        });
    }
});

router.patch("/update-read", authenticateToken, async (req, res) => {
    const userId = req.user.userId; // Extract user ID from JWT token payload
    const { book_id, group_id, read } = req.body; // Extract book ID, group ID, and read status from request body

    if (read === undefined) {
        return res.status(400).send({
            message: "Read status is required",
        });
    }

    try {
        // Update the 'read' column in the user_book table
        await db('user_book')
            .where({
                user_id: userId,
                book_id: book_id,
                group_id: group_id
            })
            .update({
                read: read,
            });

        res.status(200).send({
            message: "User book read status updated successfully",
            read: read,
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