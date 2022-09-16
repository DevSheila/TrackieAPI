const mongoose = require('mongoose');


const budgetItemSchema = new mongoose.Schema({
  type: {
        type: String,
        required: true,
  },
  category: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: false,
  },
  amount:{
    type: String,
    required: true,

  },budgetId:{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Budget',
    required: true,
  }

});

module.exports = mongoose.model('BudgetItem', budgetItemSchema);
