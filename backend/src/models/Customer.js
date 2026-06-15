const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    dateOfBirth: { type: Date },
    phone: { type: String, required: true, unique: true },
    cccd: { type: String, unique: true, sparse: true },
    address: { type: String, default: '' },
    email: { type: String, unique: true, sparse: true },
    status: {
        type: String,
        enum: ['active', 'inactive', 'locked'],
        default: 'active'
    },
    medicalHistory: { type: String, default: '' },
    hasDebt: { type: Boolean, default: false }
}, {
    collection: 'customers',
    timestamps: true
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
