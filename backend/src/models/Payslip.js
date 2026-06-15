const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    month: {
        type: String, // Format: MM/yyyy
        required: true
    },
    baseSalaryAmount: {
        type: Number,
        required: true,
        min: 0
    },
    doctorCoefficient: {
        type: Number,
        required: true,
        min: 0
    },
    totalShifts: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    hoursPerShift: {
        type: Number,
        required: true,
        default: 8
    },
    totalShiftCoefficient: {
        type: Number,
        required: true,
        default: 0
    },
    totalEquivalentHours: {
        type: Number,
        required: true,
        min: 0
    },
    totalSalary: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['Bản nháp', 'Đã chốt'],
        default: 'Bản nháp'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Ensure one payslip per doctor per month
payslipSchema.index({ doctorId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Payslip', payslipSchema);
