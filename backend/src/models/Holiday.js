const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ['all', 'department'],
    required: true,
  },
  department: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  }
}, {
  timestamps: true
});

holidaySchema.index({ startDate: 1, endDate: 1 });

const Holiday = mongoose.model('Holiday', holidaySchema);

module.exports = Holiday;
