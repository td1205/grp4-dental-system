
const mongoose = require('mongoose');
const User = require('./User');

const adminSchema = new mongoose.Schema({
    //de trong neu chua can them du lieu dac biet
    //await seedAdminAccount()

});

const Admin = User.discriminator('Admin', adminSchema);

module.exports = Admin;