const mongoose = require('mongoose');
const User = require('./User');

const customerSchema = new mongoose.Schema({
  medicalHistory: { type: String, default: '' }
  // Có thể thêm các trường đặc thù của khách hàng nếu cần
});

const Customer = User.discriminator('Customer', customerSchema);


module.exports = Customer;
