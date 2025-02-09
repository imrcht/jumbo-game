const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('../utils/config');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, config.SALT_ROUNDS);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
