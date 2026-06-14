const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
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
  endTime: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'Chờ tiếp đón',
    enum: ['Chờ tiếp đón', 'Chờ khám', 'Đang khám', 'Đã xác nhận', 'Đã dời', 'Đã hủy', 'Không đến', 'Hoàn thành'],
  },
  notes: {
    type: String,
    default: '',
  },
  cancelReason: {
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
