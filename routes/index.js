// Imports
// Express imports
const express = require("express");
const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get a hello message.
 *     tags:
 *       - Root
 *     description: Retrieve a simple hello message.
 *     responses:
 *       200:
 *         description: A hello World.
 *         content:
 *           application/json:
 *             example:
 *               message: Hello, World!
 */
router.get('/', (req, res) => {
    res.json({ message: 'IDOR 2 ATO Labs' });
  });

  const jwt = require('jsonwebtoken');


  const secretKey = process.env.Secret
  
  const flag = "fl4g{ w3ld0n3 y0u l33t h4x0r}"
  
  // Protect a route with JWT
  
  /**
   * @swagger
   * /flag:
   *   get:
   *     summary: Flag route
   *     tags:
 *       - Root
   *     description: Endpoint to access the flag.
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Access granted. Returns information about the authenticated user and flag.
   *       401:
   *         description: Unauthorized. Token is required or invalid token.
   */
  router.get('/flag', (req, res) => {
      const token = req.header('Authorization');
  
      if (!token) {
          return res.status(401).json({ message: 'Token is required' });
      }
  
      jwt.verify(token, secretKey, (err, user) => {
          if (err) {
              return res.status(401).json({ message: 'Invalid token' });
          }
  
          // Check the user's role before granting access
          if (user.role === 'admin') {
              // Access is granted for users with the 'admin' role
  
              res.json({ message: 'This is a protected resource', user, "flag": flag });
          } else {
              // Access is denied for users without the 'admin' role
              res.status(403).json({ message: 'Access denied' });
          }
      });
  });

module.exports = router;