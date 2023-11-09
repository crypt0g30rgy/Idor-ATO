// Imports
// Express imports
const express = require("express");
const router = express.Router();

const UserModel = require("../model/userModel"); // for user model
const VerificationToken = require("../model/verificationTokenModel")

const crypto = require('crypto');
const nodemailer = require('nodemailer');

const jwt = require('jsonwebtoken');


const secretKey = process.env.Secret

// Configure your email service and create a transporter
// Send verification email with token link
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
    },
});

// Generate a random token
function generateRandomToken() {
    return crypto.randomBytes(20).toString('hex');
}

/**
 * @swagger
 * /email/{userId}:
 *   post:
 *     summary: Change Email.
 *     tags:
 *       - Email Change
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: User's ID (UUID) to send the verification token to.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Verification token sent successfully.
 *       400:
 *         description: Invalid request or user not found.
 *       500:
 *         description: Internal server error.
 */
router.post('/:userId', async (req, res) => {
    const userId = req.params.userId;

    const { email } = req.body;

    // Generate a random token
    const token = generateRandomToken();

    const auth = req.header('Authorization');

    if (!auth) {
        return res.status(401).json({ message: 'Token is required' });
    }

    jwt.verify(auth, secretKey, async (err) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        try {
            // Store the token with the user's _id for later verification
            const user = await UserModel.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            user.email = email
            user.isEmailVerified = false;
            await user.save();

            const verificationCode = new VerificationToken({
                userId: user._id.toString(),
                token,
            });
            await verificationCode.save();

            // Create an email with the token
            const mailOptions = {
                from: process.env.SMTP_FROM_EMAIL,
                to: email,
                subject: 'Verification Token',
                text: `Your verification token is: ${token}`,
            };

            // Send the email with the token
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(error);
                    res.status(500).json({ message: 'Failed to send email' });
                } else {
                    console.log('Email sent: ' + info.response);
                    // Respond with 204 status outside the sendMail callback
                    res.status(204).end();
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
});

// Implement a route for verifying the token and resetting the password

/**
 * @swagger
 * /email/{userId}/accept/{verificationCode}:
 *   patch:
 *     summary: Accept email Change with code.
 *     tags:
 *       - Email Change
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: User's ID (UUID) to verify the email for.
 *         required: true
 *         schema:
 *           type: string
 *       - name: verificationCode
 *         in: path
 *         description: Verification code received by the user.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified successfully.
 *       400:
 *         description: Invalid verification code or user not found.
 *       500:
 *         description: Internal server error.
 */
router.patch('/:userId/accept/:verificationCode', async (req, res) => {
    const userId = req.params.userId;
    const token = req.params.verificationCode;

    console.log(userId)

    const auth = req.header('Authorization');

    if (!auth) {
        return res.status(401).json({ message: 'Token is required' });
    }

    jwt.verify(auth, secretKey, async (err) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        try {


            console.log(token)

            // Check if the token matches the stored token
            const verificationCode = await VerificationToken.findOne({ token });

            console.log(verificationCode)

            if (!verificationCode) {
                return res.status(400).json({ message: 'Invalid or expired token' });
            }

            // Update the user's password in the database
            const user = await UserModel.findById(userId);

            console.log(user)

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            user.isEmailVerified = true;
            await user.save();

            // Delete the token from the collection
            await verificationCode.deleteOne();

            res.json({ message: 'Verification successful' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
});


module.exports = router;