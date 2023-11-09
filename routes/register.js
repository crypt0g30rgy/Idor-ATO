// Imports
// Express imports
const express = require("express");
const router = express.Router();

const UserModel = require("../model/userModel"); // for user model

const bcrypt = require("bcryptjs"); // to encrypt password


// Create a signup endpoint

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register New User
 *     tags:
 *       - Auth
 *     description: Registering a new account.
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

    //console.log(req.body)

    if (!email || !password) {
        return res.status(400).json({ "status": "error", message: 'Username and password are required' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    try {

        const existingAccount = await UserModel.findOne({ email: email.toLowerCase() });

        // console.log(existingAccount)

        //console.log(JSON.stringify(existingAccount, null, 2))

        if (existingAccount != null) {
            if (existingAccount.email === email.toLowerCase()) {
                return res.status(409).json({ "status": "failed", message: 'User already exists' });
            }
        } else {

            const isoDOB = "01/01/1999"

            //---USER MODEL---
            user = new UserModel({
                firstname: '',
                lastname: '',
                birthDate: isoDOB,
                email: email.toLowerCase(),
                password: hashedPassword,
            });

            await user.save();
            res.status(201).json({ "status": "success", message: 'User created successfully', "user": user });
        }

    } catch (error) {
        //console.log(error)
        res.status(500).json({ "status": "failure", error: 'Internal server error' });
    }
});

module.exports = router;

