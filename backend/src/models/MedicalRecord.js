const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
  },
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
  reason: {
    type: String,
    required: true,
  },
  symptoms: {
    type: String,
    required: true,
  },
  medicalHistory: {
    type: String,
    default: '',
  },
  diagnosisCode: {
    type: String,
    required: true, // EF3.2.2: Bắt buộc nhập chẩn đoán
  },
  diagnosisNote: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: 'Hoàn thành', // Lúc tạo xong auto là hoàn thành
  },
  patientCoefficient: {
    type: Number,
    default: 0,
    min: 0,
    max: 0.5
  },
  coefficientNote: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
module.exports = MedicalRecord;
