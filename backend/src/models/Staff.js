const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female'],
  },
  idNumber: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  personalEmail: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: { // Corresponds to position
    type: String,
    required: true,
    enum: ['doctor', 'receptionist', 'nurse', 'admin'],
  },
  department: {
    type: String,
    required: true,
  },
  specialty: {
    type: String,
    default: null,
  },
  startDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'active', 'suspended', 'inactive'],
  },
  suspendReason: {
    type: String,
    default: null,
  },
  activationToken: {
    type: String,
    default: null,
  },
  dob: {
    type: Date,
  },
  degree: {
    type: String,
    default: null,
  },
  username: {
    type: String,
  }
}, {
  timestamps: true // Automatically creates createdAt and updatedAt
});

// Create an index for faster text search
staffSchema.index({ fullName: 'text', id: 'text' });

const Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff;
