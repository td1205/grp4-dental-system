const User = require('../models/User');
const Admin = require('../models/Admin');
const Doctor = require('../models/Doctor');
const Receptionist = require('../models/Receptionist');
const crypto = require('crypto');
const sendEmail = require('../utils/mailer');
const bcrypt = require('bcryptjs');

// --- 1. HÀM TỰ ĐỘNG SINH MÃ NHÂN VIÊN ---
const generateStaffId = async (role) => {
    let prefix = 'NV';
    if (role === 'Doctor') {
        prefix = 'BS';
    } else if (role === 'Receptionist') {
        prefix = 'LT';
    } else if (role === 'Admin') {
        prefix = 'AD';
    }

    const now = new Date();
    const yyyy = now.getFullYear().toString();
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const baseString = prefix + yyyy + mm;

    const lastStaff = await User.findOne({ ma_nhan_vien: new RegExp('^' + baseString) })
        .sort({ ma_nhan_vien: -1 });

    let stt = 1;
    if (lastStaff && lastStaff.ma_nhan_vien) {
        const lastSttStr = lastStaff.ma_nhan_vien.replace(baseString, '');
        const lastSttNum = parseInt(lastSttStr, 10);
        if (!isNaN(lastSttNum)) {
            stt = lastSttNum + 1;
        }
    }

    return baseString + stt.toString().padStart(2, '0');
};

// --- 2. API LẤY DANH SÁCH ---
const getAllStaff = async (req, res) => {
    try {
        const staffs = await User.find();
        return res.status(200).json({
            message: 'Lấy danh sách thành công',
            total: staffs.length,
            data: staffs
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};
const createStaff = async (req, res) => {
    try {
        const data = req.body;

        // 1. Tự sinh mã nhân viên và trạng thái
        data.ma_nhan_vien = await generateStaffId(data.role);
        data.trang_thai = 'Chờ kích hoạt';

        // 🌟 2. TỰ SINH EMAIL NỘI BỘ THEO ĐÚNG ROLE
        let domain = 'dentalcare.com';
        if (data.role === 'Doctor') domain = 'BS.dentalcare.com';
        else if (data.role === 'Receptionist') domain = 'LT.dentalcare.com';
        else if (data.role === 'Admin') domain = 'AD.dentalcare.com';

        // Ép mã nhân viên thành chữ thường + @ + domain (VD: bs20260601@BS.dentalcare.com)
        data.email_noi_bo = `${data.ma_nhan_vien.toLowerCase()}@${domain}`;

        // 3. Token bảo mật
        const resetToken = crypto.randomBytes(32).toString('hex');
        data.activationToken = resetToken;
        data.activationExpires = Date.now() + 24 * 60 * 60 * 1000;

        // 4. Lưu vào DB
        let newStaff;
        if (data.role === 'Admin') newStaff = new Admin(data);
        else if (data.role === 'Doctor') newStaff = new Doctor(data);
        else if (data.role === 'Receptionist') newStaff = new Receptionist(data);
        else return res.status(400).json({ message: 'Vai trò (role) không hợp lệ.' });

        await newStaff.save();

        // 5. Gửi email với giao diện cập nhật
        if (data.email) {
            const inviteLink = `http://localhost:5174/activate?token=${resetToken}&email=${data.email_noi_bo}`;
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
                    <h2>Chào mừng bạn gia nhập Hệ thống Nha Khoa DentalCare!</h2>
                    <p>Xin chào <strong>${data.name}</strong>,</p>
                    <p>Tài khoản nhân sự của bạn đã được quản trị viên khởi tạo thành công. Dưới đây là thông tin định danh của bạn:</p>
                    <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <ul style="list-style-type: none; padding: 0; margin: 0;">
                            <li><strong>Mã nhân viên:</strong> ${data.ma_nhan_vien}</li>
                            <li><strong>Vai trò:</strong> ${data.role}</li>
                            <li><strong>Email đăng nhập:</strong> <span style="color: #007BFF;">${data.email_noi_bo}</span></li>
                        </ul>
                    </div>
                    <p>Để bắt đầu sử dụng phần mềm, vui lòng click vào nút bên dưới để thiết lập mật khẩu cá nhân và kích hoạt tài khoản (Link có hiệu lực trong 24 giờ):</p>
                    <a href="${inviteLink}" style="display: inline-block; padding: 12px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; font-weight: bold;">
                        KÍCH HOẠT TÀI KHOẢN
                    </a>
                    <hr style="margin-top: 30px; border: 0; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #888;">Đây là email tự động từ hệ thống DentalCare, vui lòng không trả lời thư này.</p>
                </div>
            `;

            await sendEmail({
                email: data.email, // Vẫn gửi về email cá nhân thật
                subject: `[DentalCare] Thông tin tài khoản nội bộ - ${data.ma_nhan_vien}`,
                html: emailHtml
            });
            console.log(`✉️ ĐÃ GỬI EMAIL THÀNH CÔNG ĐẾN: ${data.email}`);
        }

        return res.status(201).json({
            message: 'Thêm mới nhân sự thành công. Đã cấp phát email nội bộ và gửi thư kích hoạt.',
            data: newStaff
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Thông tin (Email cá nhân/SĐT/CCCD) đã tồn tại trên hệ thống' });
        }
        return res.status(400).json({ message: 'Lỗi khi tạo nhân viên', error: error.message });
    }
};
const activateStaff = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đủ token và mật khẩu mới' });
        }

        // Tìm nhân viên có mã token khớp và token chưa hết hạn
        const user = await User.findOne({
            activationToken: token,
            activationExpires: { $gt: Date.now() } // Kểm tra hạn 24h
        });

        if (!user) {
            return res.status(400).json({ message: 'Đường dẫn kích hoạt không hợp lệ hoặc đã hết hạn.' });
        }

        // Mã hóa mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Cập nhật trạng thái và xóa token để không dùng lại được nữa
        user.trang_thai = 'Đang hoạt động';
        user.activationToken = undefined;
        user.activationExpires = undefined;

        await user.save();

        return res.status(200).json({ message: 'Kích hoạt tài khoản thành công!' });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server khi kích hoạt', error: error.message });
    }
};
// --- 4. API ĐĂNG NHẬP ---
const loginStaff = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
        }

        const user = await User.findOne({ email_noi_bo: email });
        if (!user) {
            return res.status(401).json({ message: 'Tài khoản không tồn tại trên hệ thống' });
        }

        if (user.trang_thai === 'Chờ kích hoạt') {
            return res.status(403).json({ message: 'Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email.' });
        }
        if (user.trang_thai !== 'Đang hoạt động') {
            return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa hoặc đình chỉ' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Mật khẩu không chính xác' });
        }

        return res.status(200).json({
            message: 'Đăng nhập thành công',
            token: 'fake-jwt-token-for-now',
            user: {
                id: user._id,
                ma_nhan_vien: user.ma_nhan_vien,
                name: user.name,
                email: user.email_noi_bo,
                role: user.role.toLowerCase(),
                status: 'active'
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server khi đăng nhập', error: error.message });
    }
};

// Đảm bảo module.exports nằm ở DƯỚI CÙNG của file
module.exports = {
    getAllStaff,
    createStaff,
    activateStaff,
    loginStaff
};