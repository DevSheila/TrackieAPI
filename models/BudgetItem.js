const mongoose = require('mongoose');

const budgetItemSchema = new mongoose.Schema({
  type: {
        type: String,
        required: false,
  },
  category: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  desc: {
    type: String,
    required: true,
  },
  amount:{
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('BudgetItem', budgetItemSchema);
