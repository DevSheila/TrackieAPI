const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  amount:{
    type: String,
    required: true,
  },
  date:{
    type: String,
    required: true,
  },
  created: {
    type: String,
    default: new Date().toISOString(),
  },
});

module.exports = mongoose.model('Income', incomeSchema);
