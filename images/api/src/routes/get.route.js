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

  router.get("/student/groups", authenticateToken, async (req, res) => {
    const user_id = req.user.userId; // Extract user ID from JWT token payload

    try {
        // Query to find all groups where the user is a member
        const userGroups = await db('user_group')
            .join('group', 'user_group.group_id', '=', 'group.id')
            .join('user', 'group.created_by', '=', 'user.id')
            .where('user_group.user_id', user_id)
            .select('group.*', 'user.username as creator_username');

        res.status(200).send({
            data: userGroups,
            message: "Groups retrieved successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: "Something went wrong",
            value: error,
        });
    }
});

router.get("/book/:book_id", authenticateToken, async (req, res) => {
    const { book_id } = req.params;

    try {
        // Fetch the book details by book_id
        const book = await db('book')
            .where('id', book_id)
            .select('title', 'author', 'description')
            .first();

        if (!book) {
            return res.status(404).send({
                message: "Book not found",
            });
        }

        res.status(200).send({
            data: book,
            message: "Book retrieved successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: "Something went wrong",
            value: error,
        });
    }
});


router.get("/teacher/created-groups", authenticateToken, async (req, res) => {
  const user_id = req.user.userId; // Extract user ID from JWT token payload

  try {
      // Query to find all groups where created_by matches the authenticated user's ID
      const createdGroups = await db('group')
          .join('user', 'group.created_by', '=', 'user.id')
          .where('group.created_by', user_id)
          .select('group.*', 'user.username as creator_username');

      res.status(200).send({
          data: createdGroups,
          message: "Created groups retrieved successfully",
      });
  } catch (error) {
      console.error(error);
      res.status(500).send({
          error: "Something went wrong",
          value: error,
      });
  }
});

router.get("/group/:group_id", authenticateToken, async (req, res) => {
  const { group_id } = req.params; // Extract group ID from the request parameters

  try {
      // Query to find the group info by group ID
      const groupInfo = await db('group')
          .join('user', 'group.created_by', '=', 'user.id')
          .where('group.id', group_id)
          .select('group.*', 'user.username as creator_username')
          .first();

      if (!groupInfo) {
          return res.status(404).send({
              message: "Group not found",
          });
      }

      res.status(200).send({
          data: groupInfo,
          message: "Group info retrieved successfully",
      });
  } catch (error) {
      console.error(error);
      res.status(500).send({
          error: "Something went wrong",
          value: error,
      });
  }
});

router.get("/group/:group_id/book_history", authenticateToken, async (req, res) => {
  const { group_id } = req.params; // Extract group ID from the request parameters

  try {
      // Query to find all books where the group_id matches the provided group ID
      const books = await db('group_book_history')
          .join('book', 'group_book_history.book_id', '=', 'book.id')
          .where('group_book_history.group_id', group_id)
          .select(
              'book.id as book_id',
              'book.title',
              'book.cover',
              'book.author',
              'book.description',
              'group_book_history.completed'
          );

      // If no books found, return an empty array
      if (!books.length) {
          return res.status(200).send({
              data: [],
              message: "No books found for the specified group",
          });
      }

      // Add counts for likes, reads, and comments for each book
      for (const book of books) {
          const [likeCount, readCount, commentCount] = await Promise.all([
              db('user_book')
                  .where('book_id', book.book_id)
                  .andWhere('group_id', group_id)
                  .andWhere('liked', true)
                  .count('id as count')
                  .first(),
              db('user_book')
                  .where('book_id', book.book_id)
                  .andWhere('group_id', group_id)
                  .andWhere('read', true)
                  .count('id as count')
                  .first(),
              db('book_comments')
                  .where('book_id', book.book_id)
                  .andWhere('group_id', group_id)
                  .count('id as count')
                  .first()
          ]);

          book.likes = likeCount.count;
          book.reads = readCount.count;
          book.comments = commentCount.count;
      }

      res.status(200).send({
          data: books,
          message: "Books retrieved successfully",
      });
  } catch (error) {
      console.error(error);
      res.status(500).send({
          error: "Something went wrong",
          value: error,
      });
  }
});

  router.get("/group/:group_id/books", authenticateToken, async (req, res) => {
    const { group_id } = req.params; // Extract group ID from the request parameters
  
    try {
      // Query to find all books where the group_id matches the provided group ID
      const books = await db('book')
        .where('group', group_id)
        .select('*');
  
      res.status(200).send({
        data: books,
        message: "Books retrieved successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        error: "Something went wrong",
        value: error,
      });
    }
  });

  router.get("/group/:group_id/users", authenticateToken, async (req, res) => {
    const { group_id } = req.params; // Extract group ID from the request parameters
  
    try {
      // Query to find all users where the group_id matches the provided group ID
      const users = await db('user_group')
        .join('user', 'user_group.user_id', '=', 'user.id')
        .join('rank', 'user.rank', '=', 'rank.id')
        .where('user_group.group_id', group_id)
        .select('user.id', 'user.username', 'user.email', 'user.profile_picture', 'rank.rank', 'rank.color');
  
      res.status(200).send({
        data: users,
        message: "Users retrieved successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        error: "Something went wrong",
        value: error,
      });
    }
  });

  router.get("/book/:book_id/questions", async (req, res) => {
    const { book_id } = req.params; // Extract book ID from the request parameters

    try {
        // Fetch all questions related to the specified book
        const questions = await db('question')
            .where('question_about', book_id)
            .select('id as question_id', 'question');

        // Fetch all options for each question
        for (const question of questions) {
            question.options = await db('question_option')
                .where('question_id', question.question_id)
                .select('id as option_id', 'option');

            // Calculate the total count of answers for the current question
            const totalAnswersResult = await db('user_answer')
                .where('question_id', question.question_id)
                .count('chosen_option_id as total')
                .first();
            const totalAnswers = totalAnswersResult.total;

            // Calculate the percentage of answers for each option
            for (const option of question.options) {
                const optionAnswersResult = await db('user_answer')
                    .where('question_id', question.question_id)
                    .where('chosen_option_id', option.option_id)
                    .count('chosen_option_id as count')
                    .first();
                const optionAnswers = optionAnswersResult.count;

                option.percentage = totalAnswers ? Math.round((optionAnswers * 100) / totalAnswers) : 0;
            }
        }

        res.status(200).send({
            book_id: book_id, // Include the book_id in the response
            data: questions,
            message: "Questions retrieved successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: "Something went wrong",
            value: error,
        });
    }
});

router.get("/group/:group_id/book/:book_id/likes", authenticateToken, async (req, res) => {
    const { group_id, book_id } = req.params;
  
    try {
        // Fetch users who liked the specified book in the specified group
        const likedBooks = await db('user_book')
            .where({
                group_id: group_id,
                book_id: book_id,
                liked: true
            })
            .select('user_id');

        if (!likedBooks.length) {
            return res.status(200).send({
                data: [],
                message: "No users found who liked the book in this group",
            });
        }

        const userIds = likedBooks.map(like => like.user_id);

        // Fetch user details including rank
        const users = await db('user')
            .leftJoin('rank', 'user.rank', 'rank.id')
            .whereIn('user.id', userIds)
            .select('user.id', 'user.username', 'user.email', 'user.profile_picture', 'rank.rank');

        res.status(200).send({
            data: users,
            message: "Users who liked the book retrieved successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: "Something went wrong",
            value: error,
        });
    }
});

  router.get("/group/:group_id/book/:book_id/read", authenticateToken, async (req, res) => {
    const { group_id, book_id } = req.params;
  
    try {
      // Fetch users who have read the specified book in the specified group
      const readBooks = await db('user_book')
        .where({
          group_id: group_id,
          book_id: book_id,
          read: true
        })
        .select('user_id', 'book_id', 'group_id', 'read');
  
      // Fetch the total number of users in the group
      const totalUsersInGroupResult = await db('user_group')
        .where({ group_id: group_id })
        .count('user_id as count')
        .first();
      const totalUsersInGroup = totalUsersInGroupResult.count;
  
      console.log(`Total users in group: ${totalUsersInGroup}`);
      console.log(`Users who have read the book: ${readBooks.length}`);
  
      // Check if all users in the group have read the book
      if (totalUsersInGroup == readBooks.length) {
        // Update the completed column in the group_book_history table to TRUE
        const updateResult = await db('group_book_history')
          .where({
            group_id: group_id,
            book_id: book_id
          })
          .update({ completed: true });
  
        console.log(`Update result: ${updateResult}`);
      }
  
      res.status(200).send({
        data: readBooks,
        message: "Users who have read the book retrieved successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        error: "Something went wrong",
        value: error,
      });
    }
  });

  router.get("/group/:group_id/book/:book_id/comments", authenticateToken, async (req, res) => {
    const { group_id, book_id } = req.params;
    const userId = req.user.userId; // Extract user ID from JWT token payload
  
    try {
        // Fetch all comments for the specified book and group, ordered by created_at in descending order
        const comments = await db('book_comments')
            .where({
                group_id: group_id,
                book_id: book_id
            })
            .orderBy('created_at', 'desc') // Order by created_at in descending order
            .select('user_id', 'group_id', 'book_id', 'comment', 'created_at', 'image');
  
        // Fetch user data including their ranks
        const userIds = comments.map(comment => comment.user_id);
        const users = await db('user')
            .whereIn('id', userIds)
            .select('id', 'username', 'email', 'profile_picture', 'rank');
  
        const userRanks = await db('rank')
            .whereIn('id', users.map(user => user.rank))
            .select('id', 'rank');
  
        // Create a map for user rank
        const userRankMap = {};
        userRanks.forEach(rank => {
            userRankMap[rank.id] = rank.rank;
        });
  
        // Map through comments and format the created_at information, including rank
        const commentsWithFormattedDate = comments.map(comment => {
            const user = users.find(u => u.id === comment.user_id);
            const createdAt = moment(comment.created_at);
            return {
                ...comment,
                username: user ? user.username : null,
                email: user ? user.email : null,
                profile_picture: user ? user.profile_picture : null,
                rank: user ? userRankMap[user.rank] : null,
                you: comment.user_id === userId,
                time: createdAt.format('HH:mm'),
                date: createdAt.format('ddd DD MMM YYYY')
            };
        });
  
        res.status(200).send({
            data: commentsWithFormattedDate,
            message: "Comments retrieved successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: "Something went wrong",
            value: error,
        });
    }
});


  router.get("/question/:question_id", authenticateToken, async (req, res) => {
    const { question_id } = req.params;

    try {
        // Fetch the specific question
        const question = await db('question')
            .where('id', question_id)
            .first();

        if (!question) {
            return res.status(404).send({
                message: "Question not found",
            });
        }

        // Fetch the options for the question
        const options = await db('question_option')
            .where('question_id', question_id)
            .select('id as option_id', 'option');

        // Fetch the users who chose each option
        const userAnswers = await db('user_answer')
            .where('question_id', question_id)
            .select('chosen_option_id', 'user_id');

        const userIds = userAnswers.map(answer => answer.user_id);
        const users = await db('user')
            .whereIn('id', userIds)
            .select('id', 'username', 'profile_picture');

        // Create a map of option IDs to users who chose that option
        const optionUsersMap = {};
        options.forEach(option => {
            optionUsersMap[option.option_id] = {
                ...option,
                users: []
            };
        });

        userAnswers.forEach(answer => {
            const user = users.find(u => u.id === answer.user_id);
            if (user) {
                optionUsersMap[answer.chosen_option_id].users.push({
                    username: user.username,
                    profile_picture: user.profile_picture
                });
            }
        });

        const optionsWithUsers = Object.values(optionUsersMap);

        res.status(200).send({
            question: {
                id: question.id,
                question: question.question
            },
            options: optionsWithUsers,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: "Something went wrong",
            value: error,
        });
    }
});

// Route to get the last vote for a group and check if it is completed
router.get("/group/:group_id/last-vote", authenticateToken, async (req, res) => {
    const { group_id } = req.params;

    try {
        // Fetch the last vote created for the group
        const lastVote = await db('vote')
            .where('group_id', group_id)
            .orderBy('created_at', 'desc')
            .first();

        if (!lastVote) {
            return res.status(404).send({
                message: "No votes found for the group",
            });
        }

        // Check if the last vote is completed
        const isCompleted = lastVote.ended;

        res.status(200).send({
            vote_id: lastVote.id,  // Include the vote ID in the response
            isCompleted: isCompleted ? true : false, // Return the completed status directly
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: "Something went wrong",
            value: error,
        });
    }
});


router.get("/group/:group_id/ongoing-vote", authenticateToken, async (req, res) => {
  const { group_id } = req.params;

  try {
      // Fetch the ongoing vote for the group
      const ongoingVote = await db('vote')
          .where('group_id', group_id)
          .andWhere('ended', false)
          .orderBy('created_at', 'desc')
          .first();

      if (!ongoingVote) {
          return res.status(404).send({
              message: "No ongoing votes found for the group",
          });
      }

      const vote_id = ongoingVote.id;

      // Fetch the books involved in the ongoing vote
      const voteGroupBooks = await db('vote_group_book')
          .where('vote_id', vote_id)
          .select('book_id');

      if (voteGroupBooks.length === 0) {
          return res.status(404).send({
              message: "No books found for the ongoing vote",
          });
      }

      const bookIds = voteGroupBooks.map(vgb => vgb.book_id);

      // Fetch the votes for each book
      const bookVotes = await db('vote_group_book')
          .whereIn('book_id', bookIds)
          .andWhere('vote_id', vote_id)
          .groupBy('book_id')
          .select('book_id', db.raw('COUNT(user_id) as votes'))
          .orderBy('votes', 'desc');

      // Fetch the users who voted for each book
      const userVotes = await db('vote_group_book')
          .whereIn('book_id', bookIds)
          .andWhere('vote_id', vote_id)
          .select('book_id', 'user_id');

      const userIds = userVotes.map(uv => uv.user_id);
      const users = await db('user')
          .whereIn('id', userIds)
          .select('id', 'username', 'profile_picture');

      // Create a map of book IDs to users who voted for them
      const bookUsersMap = {};
      bookVotes.forEach(bookVote => {
          bookUsersMap[bookVote.book_id] = {
              book_id: bookVote.book_id,
              votes: bookVote.votes,
              users: []
          };
      });

      userVotes.forEach(userVote => {
          const user = users.find(u => u.id === userVote.user_id);
          if (user) {
              bookUsersMap[userVote.book_id].users.push({
                  username: user.username,
                  profile_picture: user.profile_picture
              });
          }
      });

      // Fetch the details of the books
      const books = await db('book')
          .whereIn('id', bookIds)
          .select('id', 'title', 'author', 'cover');

      books.forEach(book => {
          if (bookUsersMap[book.id]) {
              bookUsersMap[book.id].title = book.title;
              bookUsersMap[book.id].author = book.author;
              bookUsersMap[book.id].cover = book.cover;
          }
      });

      const booksWithUsers = Object.values(bookUsersMap);

      // Get the book with the most votes
      const mostVotedBook = bookVotes.length ? bookVotes[0].book_id : null;

      res.status(200).send({
          ongoingVote: {
              vote_id: ongoingVote.id,
              group_id: ongoingVote.group_id,
              completed: ongoingVote.ended,
              books: booksWithUsers,
              mostVotedBook
          },
      });
  } catch (error) {
      console.error(error);
      res.status(500).send({
          error: "Something went wrong",
          value: error,
      });
  }
});


  
router.get("/group/:group_id/remaining-books", authenticateToken, async (req, res) => {
    const { group_id } = req.params;

    try {
        // Fetch all books in the group
        const allBooksInGroup = await db('book')
            .where('group', group_id)
            .select('id', 'title', 'author', 'description', 'cover');

        // Fetch all books that have been added to group_book_history for the given group
        const booksInHistory = await db('group_book_history')
            .where('group_id', group_id)
            .select('book_id');

        const bookIdsInHistory = booksInHistory.map(book => book.book_id);

        // Filter out the books that appear in group_book_history
        const remainingBooks = allBooksInGroup.filter(book => !bookIdsInHistory.includes(book.id));

        res.status(200).send({
            remainingBooks,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: "Something went wrong",
            value: error,
        });
    }
});

router.get("/user/:user_id", authenticateToken, async (req, res) => {
    const { user_id } = req.params;

    try {
        // Fetch the user data
        const user = await db('user')
            .where('id', user_id)
            .first();

        if (!user) {
            return res.status(404).send({
                message: "User not found",
            });
        }

        // Fetch the user's rank details
        const rank = await db('rank')
            .where('id', user.rank)
            .first();

        // Include the rank details in the user data
        const userData = {
            ...user,
            rank: rank.rank,
            color: rank.color 
        };

        res.status(200).send({
            user: userData,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: "Something went wrong",
            value: error,
        });
    }
});

router.get("/group/find/:code", authenticateToken, async (req, res) => {
  const { code } = req.params; // Extract group code from the URL parameters

  try {
      // Fetch the group with the specified code
      const group = await db('group')
          .where('code', code)
          .first();

      if (!group) {
          return res.status(404).send({
              message: "Group not found",
          });
      }

      res.status(200).send({
          data: group,
          message: "Group retrieved successfully",
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