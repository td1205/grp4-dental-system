const mongoose = require('mongoose');
const User = require('./User');

const customerSchema = new mongoose.Schema({
  // Có thể thêm các trường đặc thù của khách hàng nếu cần
});

const Customer = User.discriminator('Customer', customerSchema);


module.exports = Customer;
