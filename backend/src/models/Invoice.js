const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: false,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['Tiền mặt', 'Chuyển khoản QR', 'Quẹt thẻ POS'],
    required: true,
  },
  revenueType: {
    type: String,
    enum: ['Khám bệnh', 'Thuốc', 'Cận lâm sàng', 'Khác'],
    default: 'Khám bệnh'
  },
  department: {
    type: String,
    enum: ['Phòng khám 1', 'Phòng khám 2', 'Phòng khám 3', 'Phòng phẫu thuật', 'Quầy Lễ Tân', 'Khác'],
    default: 'Phòng khám 1'
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;
