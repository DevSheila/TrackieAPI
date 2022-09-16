const mongoose = require('mongoose');


const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
  },
  startDate:{
    type: String,
    required: true,
  },
  endDate:{
    type: String,
    required: true,

  },
  created: {
    type: String,
    default: new Date().toISOString(),
  },
});

module.exports = mongoose.model('Budget', budgetSchema);
