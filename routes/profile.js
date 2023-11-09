// Imports
// Express imports
const express = require("express");
const router = express.Router();

const jwt = require('jsonwebtoken');

const UserModel = require("../model/userModel"); // for user model


const secretKey = process.env.Secret

// Create a route to query the database and return all IDs

/**
 * @swagger
 * /profile/all:
 *   get:
 *     summary: ids route
 *     description: Endpoint to access the ids.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Access granted. Returns all ids in DB.
 *       401:
 *         description: Unauthorized. Token is required or invalid token.
 */
router.get('/all', (req, res) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Token is required' });
  }

  jwt.verify(token, secretKey, async (err) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    try {
      const ids = await UserModel.find({}, '_id');

      res.json({ ids });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

/**
 * @swagger
 * /profile/me:
 *   get:
 *     summary: get user details
 *     description: Endpoint to access my user data.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Access granted. Returns user details.
 *       401:
 *         description: Unauthorized. Token is required or invalid token.
 */
router.get('/me', (req, res) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Token is required' });
  }

  jwt.verify(token, secretKey, async (err, user) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const userId = user.userId;

    console.log(userId)

    try {

      const foundUser = await UserModel.findById(userId);

      if (!foundUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ user: foundUser });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

module.exports = router;