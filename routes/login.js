// Imports
// Express imports
const express = require("express");
const router = express.Router();

const UserModel = require("../model/userModel"); // for user model

const bcrypt = require("bcryptjs"); // to encrypt password

const jwt = require('jsonwebtoken');


const secretKey = process.env.Secret

// Create a login endpoint

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authenticate and receive a JWT token.
 *     tags:
 *       - Auth
 *     description: Authenticate a user and receive a JWT token.
 *     parameters:
 *       - in: body
 *         name: body
 *         description: User credentials.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               example: test@local.net
 *             password:
 *               type: string
 *               example: password123
 *     responses:
 *       200:
 *         description: Successfully logged in.
 *       401:
 *         description: Unauthorized - Invalid credentials.
 *       429:
 *         description: Too Many Requests - Rate limit exceeded.
 *       500:
 *         description: Internal Server Error.
 */
router.post('/', async (req, res) => {
    const { email, password } = req.body;

    console.log(req.body)

    if (!email || !password) {
        return res.status(400).json({ "status": "error", message: 'Email and password are required' });
    }

    try {
        const user = await UserModel.findOne({ email: email.toLowerCase() }).select('password role');

        console.log(user)

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ "status": "failed", message: 'Invalid login credentials' });
        }

        const payload = { email, userId: user._id, role: user.role };

        const token = jwt.sign(payload, secretKey, { expiresIn: "6hr" }
        );
        res.json({ "status": "success", "token": token });
    } catch (error) {
        console.log(error)
        res.status(500).json({ "status": "failure", error: 'Internal server error' });
    }
});

module.exports = router;