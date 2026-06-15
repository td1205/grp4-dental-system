const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  medicalRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord',
    required: true,
  },
  items: [
    {
      medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      dosage: {
        type: String,
        required: true,
      },
      usage: {
        type: String,
        default: ''
      }
    }
  ]
}, {
  timestamps: true
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);
module.exports = Prescription;
