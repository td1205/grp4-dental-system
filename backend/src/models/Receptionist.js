const mongoose = require('mongoose');
const User = require('./User');

const receptionistSchema = new mongoose.Schema({
    receptionistId: { type: String, required: true, unique: true }
});

const Receptionist = User.discriminator('Receptionist', receptionistSchema);

module.exports = Receptionist;