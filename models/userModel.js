// src/models/userModel.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  _id: { type: String, default: uuidv4 },
  domain: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: String,
  tokens: [{ token: { type: String, required: true } }],
  type: { type: String, enum: ['auto', 'manual'], default: 'manual' },
  role: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null },
  created_by: String,  // Add created_by field
  updated_by: String,  // Add updated_by field
  deleted_by: String
});

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

userSchema.methods.generateAuthToken = function () {
  const user = this;
  const tokenData = {
    _id: user._id,
    username: user.username,
    name: user.name,
    role: user.role,
    type: user.type,
    domain: user.domain,
  };
  const token = jwt.sign(tokenData, config.jwtSecretKey);
  user.tokens = user.tokens.concat({ token });
  user.save();
  return token;
};

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  const User = mongoose.model('User', userSchema);

  const adminCount = await User.countDocuments({ username: 'admin' }).exec();
  if (adminCount === 0) {
    const adminUser = new User({
      domain: 'admin',
      username: 'admin',
      password: 'password',
      name: 'admin',
      role: 'admin'
    });
    await adminUser.save();
    console.log('Admin user created successfully.');
  } else {
    console.log('Admin user already exists.');
  }
}

createAdminUser();

module.exports = User;