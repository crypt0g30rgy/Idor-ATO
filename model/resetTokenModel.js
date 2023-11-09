const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: 'User',
  },
  token: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '6h', // Set token expiration time (e.g., 1 hour)
  },
});

const PasswordResetToken = mongoose.model('PasswordResetToken', tokenSchema);

module.exports = PasswordResetToken;