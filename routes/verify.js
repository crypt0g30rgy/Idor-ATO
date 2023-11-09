// Imports
// Express imports
const express = require("express");
const router = express.Router();

const UserModel = require("../model/userModel"); // for user model
const VerificationToken = require("../model/verificationTokenModel")

const crypto = require('crypto');
const nodemailer = require('nodemailer');

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
 * /verify:
 *   post:
 *     summary: Reset Password
 *     tags:
 *       - Email Verification
 *     description: Reset Password with email.
 *     parameters:
 *       - in: body
 *         name: body
 *         description: User E-Mail.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               example: test@local.net
 *     responses:
 *       204:
 *         description: Token Sent.
 *       404:
 *         description: User with email not found.
 *       429:
 *         description: Too Many Requests - Rate limit exceeded.
 *       500:
 *         description: Internal Server Error.
 */

router.post('/', async (req, res) => {
    const { email } = req.body;

    // Generate a random token
    const token = generateRandomToken();

    console.log(token)

    try {
        // Store the token with the user's _id for later verification
        const user = await UserModel.findOne({ email }); // Assuming you have a 'User' model
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(user)

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

// Implement a route for verifying the token and resetting the password

/**
 * @swagger
 * /verify:
 *   put:
 *     summary: Reset Password
 *     description: Reset Password with token.
 *     tags:
 *       - Email Verification
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
 *             token:
 *               type: string
 *               example: abc123
 *     responses:
 *       200:
 *         description: Password reset successful.
 *       400:
 *         description: Bad request - Invalid or expired token.
 *       404:
 *         description: User not found.
 *       429:
 *         description: Too Many Requests - Rate limit exceeded.
 *       500:
 *         description: Internal Server Error.
 */
router.put('/', async (req, res) => {
    const { email, token } = req.body;

    if (!email || !token) {
        return res.status(400).json({ "status": "error", message: 'Missing required Fileds' });
    }

    try {


        // Check if the token matches the stored token
        const verificationCode = await VerificationToken.findOne({ token });

        console.log(verificationCode)

        // Find the user using the userId stored in the reset token
        const userIsOwner = await UserModel.findOne({ _id: verificationCode.userId });

        if (userIsOwner.email !== email) {
            return res.status(401).json({ message: 'Error' });
        }

        if (!verificationCode) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Update the user's password in the database
        const user = await UserModel.findOne({ email });

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


module.exports = router;