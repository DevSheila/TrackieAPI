const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone:{
    type: String,
    required: true,
  },
  created: {
    type: String,
    default: new Date().toISOString(),
  },
  password: {
    type: String,
    required: true,
  },
  lastActive: {
    type: String,
    required: false,
  },
  active: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
    required: false,
  }
});

module.exports = mongoose.model('User', userSchema);
