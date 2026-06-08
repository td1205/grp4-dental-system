const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  customerId: {
    type: String,
    required: true,
  },
  doctorId: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
  },
  notes: {
    type: String,
    default: '',
  }
}, {
  timestamps: true
});

appointmentSchema.index({ doctorId: 1, date: 1 });
appointmentSchema.index({ customerId: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
