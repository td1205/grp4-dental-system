// backend/src/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(` MongoDB đã kết nối thành công: ${conn.connection.host}`);
    } catch (error) {
        console.error(` Lỗi kết nối Database: ${error.message}`);
        process.exit(1); // Dừng server nếu không kết nối được database
    }
};

module.exports = connectDB;