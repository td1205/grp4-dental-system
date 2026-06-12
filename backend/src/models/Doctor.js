const mongoose = require('mongoose');
const User = require('./User');

const doctorSchema = new mongoose.Schema({
    doctorID: { type: String, required: false, unique: true },
    qualification: { type: String, required: false },
    academicTitle: { type: String, required: false },
    academicDegree: { type: String, required: false },
    workplace: { type: String },
});
const Doctor = User.discriminator('Doctor', doctorSchema);

module.exports = Doctor;