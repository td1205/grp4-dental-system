const mongoose = require('mongoose');

const baseOption = {
    discriminatorKey: 'role',
    collection: 'users',
    timestamps: true
};

const userSchema = new mongoose.Schema({
    ma_nhan_vien: { type: String, required: true, unique: true },
    trang_thai: {
        type: String,
        enum: ['Đang hoạt động', 'Ngừng hoạt động', 'Chờ kích hoạt', 'Đình chỉ'],
        default: 'Chờ kích hoạt'
    },
    name: { type: String, required: true },
    birthday: { type: Date, required: true },
    phone: { type: String, required: true, unique: true },
    cccd: { type: String, unique: true, sparse: true },

    email: { type: String, unique: true, sparse: true },
    email_noi_bo: { type: String, unique: true, sparse: true },
    password: { type: String },
    activationToken: { type: String },
    activationExpires: { type: Date },
    role: { type: String, required: true, enum: ['Admin', 'Doctor', 'Receptionist', 'Customer'] },
    address: { type: String, required: true },
}, baseOption);

const User = mongoose.model('User', userSchema);
module.exports = User;