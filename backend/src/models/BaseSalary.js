const mongoose = require('mongoose');

const baseSalarySchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  complexityFactor: {
    type: Number,
    required: true,
    min: 0,
    default: 1
  },
  effectiveDate: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const BaseSalary = mongoose.model('BaseSalary', baseSalarySchema);
module.exports = BaseSalary;
