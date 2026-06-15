const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config({path: './.env'});

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const res = await User.updateMany(
    { password: { $exists: true, $ne: null }, trang_thai: 'Chờ kích hoạt' },
    { $set: { trang_thai: 'Đang hoạt động' } }
  );
  console.log('Fixed users:', res.modifiedCount);
  process.exit(0);
}).catch(console.error);
