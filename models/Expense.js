const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: String,
    required: false,
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

module.exports = mongoose.model('Expense', expenseSchema);
