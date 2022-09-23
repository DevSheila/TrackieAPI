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
