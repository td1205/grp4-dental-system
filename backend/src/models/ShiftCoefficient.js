const mongoose = require('mongoose');

const shiftCoefficientSchema = new mongoose.Schema({
  morningWeekday: { type: Number, required: true, min: 1.0, default: 1.0 },
  morningWeekend: { type: Number, required: true, min: 1.0, default: 1.0 },
  morningHoliday: { type: Number, required: true, min: 1.0, default: 1.0 },
  afternoonWeekday: { type: Number, required: true, min: 1.0, default: 1.0 },
  afternoonWeekend: { type: Number, required: true, min: 1.0, default: 1.0 },
  afternoonHoliday: { type: Number, required: true, min: 1.0, default: 1.0 },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('ShiftCoefficient', shiftCoefficientSchema);
