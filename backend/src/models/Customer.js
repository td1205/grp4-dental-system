const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  cccd: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'inactive'],
  }
}, {
  timestamps: true
});

// Create text index for easy search
customerSchema.index({ name: 'text', id: 'text', phone: 'text', cccd: 'text' });

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
