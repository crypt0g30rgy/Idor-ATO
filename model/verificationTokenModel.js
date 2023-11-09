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
    expires: '24h', // Set token expiration time (e.g., 1 hour)
  },
});

const VerificationToken = mongoose.model('VerificationToken', tokenSchema);

module.exports = VerificationToken;
