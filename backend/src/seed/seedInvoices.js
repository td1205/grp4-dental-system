const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB');
    await Invoice.deleteMany({});
    
    // Find a customer to assign invoices to, or create one
    let customer = await Customer.findOne({});
    if (!customer) {
      customer = await Customer.create({
        name: 'Nguyễn Văn A',
        phone: '0901234567',
        status: 'active'
      });
    }

    const methods = ['Tiền mặt', 'Chuyển khoản QR', 'Quẹt thẻ POS'];
    const types = ['Khám bệnh', 'Thuốc', 'Cận lâm sàng'];
    const departments = ['Phòng khám 1', 'Phòng khám 2', 'Phòng khám 3'];

    const invoices = [];
    
    // Tạo data cho 6 tháng gần nhất
    const today = new Date();
    for (let i = 0; i < 100; i++) {
        const randomDaysAgo = Math.floor(Math.random() * 180);
        const paymentDate = new Date();
        paymentDate.setDate(today.getDate() - randomDaysAgo);
        
        invoices.push({
            customerId: customer._id,
            amount: Math.floor(Math.random() * 3000000) + 100000,
            paymentMethod: methods[Math.floor(Math.random() * methods.length)],
            revenueType: types[Math.floor(Math.random() * types.length)],
            department: departments[Math.floor(Math.random() * departments.length)],
            paymentDate: paymentDate
        });
    }

    await Invoice.insertMany(invoices);
    console.log(`Seeded ${invoices.length} invoices successfully.`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
