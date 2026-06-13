require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const leaveRoutes = require('./routes/leaveRoutes');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Service = require('./models/Service');
const shift = require('./models/Shift');

const staffRoutes = require('./routes/staffRoutes');
const customerRoutes = require('./routes/customerRoutes');
const serviceRoutes = require('./routes/serviceRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('MongoDB Connected successfully');
        // await seedAdminAccount();
    })
    .catch((err) => console.error('MongoDB connection error:', err));

// Tự tạo tài khoản Admin mặc định
async function seedAdminAccount() {
    try {
        const adminExists = await User.findOne({ role: 'Admin' });
        if (!adminExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('Dentalcare@123', salt);

            const adminData = {
                ma_nhan_vien: 'AD20260601',
                name: 'Hệ thống Quản trị viên',
                birthday: new Date('1990-01-01'),
                phone: '0999999999',
                cccd: '000000000000',
                email: 'admin.root@gmail.com',
                email_noi_bo: 'ad20260601@ad.dentalcare.com',
                password: hashedPassword,
                role: 'Admin',
                trang_thai: 'Đang hoạt động'
            };

            await User.create(adminData);
            console.log('[Seeding] Đã tạo tài khoản Admin mặc định thành công.');
        }
    } catch (error) {
        console.error('[Seeding] Lỗi khi tạo tài khoản Admin:', error);
    }
}

// --- API ROUTES CỦA HỆ THỐNG ---
app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/shifts', require('./routes/shiftRoutes'));

app.use('/api/leaves', leaveRoutes);
app.use('/api/staffs', staffRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/services', serviceRoutes);
app.get('/api/services', async (req, res) => {
    const data = await Service.find();
    res.json({ data });
});

app.use('/api', (_req, res) => {
    res.status(404).json({ message: 'API route not found' });
});

app.listen(PORT, () => {
    console.log(`Server đang chạy tại địa chỉ: http://localhost:${PORT}`);

});