const mongoose = require('mongoose');
const User = require('./User');

const doctorSchema = new mongoose.Schema({
    doctorID: { type: String, required: true, unique: true },
    qualification: { type: String, required: true },
    academicTitle: { type: String, required: true },
    academicDegree: { type: String, required: true },
    workplace: { type: String },
});
const Doctor = User.discriminator('Doctor', doctorSchema);

module.exports = Doctor;
