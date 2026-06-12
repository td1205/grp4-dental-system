const mongoose = require('mongoose');
const User = require('./User');

const receptionistSchema = new mongoose.Schema({

});

const Receptionist = User.discriminator('Receptionist', receptionistSchema);

module.exports = Receptionist;