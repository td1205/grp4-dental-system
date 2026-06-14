const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const users = await User.find({});
    console.log(users.map(u => `${u.name} - ${u.role}`));
    process.exit(0);
  });
