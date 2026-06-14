const User = require('../models/User');
const Admin = require('../models/Admin');
const Doctor = require('../models/Doctor');
const Receptionist = require('../models/Receptionist');
const Customer = require('../models/Customer');
const Appointment = require('../models/Appointment');
const crypto = require('crypto');
const sendEmail = require('../utils/mailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ROLES = require('../constants/roles');

// --- 1. HÀM TỰ ĐỘNG SINH MÃ NHÂN VIÊN ---
const generateStaffId = async (role) => {
    let prefix = 'NV';
    if (role === ROLES.DOCTOR) {
        prefix = 'BS';
    } else if (role === ROLES.RECEPTIONIST) {
        prefix = 'LT';
    } else if (role === ROLES.ADMIN) {
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
// --- 2. API LẤY DANH SÁCH (HỖ TRỢ LỌC, TÌM KIẾM & SẮP XẾP) ---
const getAllStaff = async (req, res) => {
    try {
        const { search: keyword, role, status, sort } = req.query;

        // 1. TẠO BỘ LỌC GỐC: Loại bỏ Khách hàng
        let query = {
            role: { $in: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, 'Bác sĩ', 'Lễ tân', 'admin', 'doctor', 'receptionist'] }
        };

        // 2. Xử lý Thanh tìm kiếm
        if (keyword) {
            query.$or = [
                { name: { $regex: keyword, $options: 'i' } },
                { phone: { $regex: keyword, $options: 'i' } },
                { email_noi_bo: { $regex: keyword, $options: 'i' } },
                { ma_nhan_vien: { $regex: keyword, $options: 'i' } }
            ];
        }


        // 3. MÁY PHIÊN DỊCH VAI TRÒ (Siêu cấp chống lỗi)
        if (role && role !== 'Tất cả vai trò' && role !== 'all' && role !== '') {
            // Chuyển mọi thứ về chữ thường để dễ soi
            const r = role.toLowerCase();

            if (r.includes('quản trị') || r === 'admin') query.role = ROLES.ADMIN;
            else if (r.includes('bác sĩ') || r === 'doctor') query.role = ROLES.DOCTOR;
            else if (r.includes('lễ tân') || r === 'receptionist') query.role = ROLES.RECEPTIONIST;
            else query.role = role; // Dự phòng
        }

        // 4. MÁY PHIÊN DỊCH TRẠNG THÁI (Siêu cấp chống lỗi)
        if (status && status !== 'Tất cả trạng thái' && status !== 'all' && status !== '') {
            const s = status.toLowerCase();

            if (s === 'active' || (s.includes('hoạt động') && !s.includes('ngừng'))) {
                query.trang_thai = 'Đang hoạt động';
            }
            else if (s === 'pending' || s.includes('chờ')) {
                query.trang_thai = 'Chờ kích hoạt';
            }
            else if (s === 'locked' || s === 'inactive' || s.includes('khóa') || s.includes('đình chỉ')) {
                query.trang_thai = 'Ngừng hoạt động'; // Hoặc sửa thành 'Đã khóa' nếu DB bạn lưu thế
            }
        }


        // 5. CẤU HÌNH SẮP XẾP (SORTING)
        let sortOptions = { createdAt: -1 }; // Mặc định: Mới nhất lên đầu

        if (sort === 'Cũ nhất') {
            sortOptions = { createdAt: 1 };
        } else if (sort === 'Tên: A-Z' || sort === 'Tên A-Z') {
            sortOptions = { name: 1 }; // 1 là A->Z
        } else if (sort === 'Tên: Z-A' || sort === 'Tên Z-A') {
            sortOptions = { name: -1 }; // -1 là Z->A
        }

        // 6. Truy vấn và Sắp xếp
        const staffs = await User.find(query).sort(sortOptions);

        return res.status(200).json({
            message: 'Lấy danh sách thành công',
            total: staffs.length,
            data: staffs
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách nhân viên:", error);
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// --- 3. API THÊM MỚI NHÂN VIÊN ---
const createStaff = async (req, res) => {
    try {
        const data = req.body;
        console.log("📦 GÓI HÀNG FRONTEND GỬI LÊN LÀ:", data);
        if (data.role) {
            const r = String(data.role).trim().toLowerCase();

            if (r.includes('bác') || r.includes('doctor')) data.role = ROLES.DOCTOR;
            else if (r.includes('lễ') || r.includes('receptionist')) data.role = ROLES.RECEPTIONIST;
            else if (r.includes('quản') || r.includes('admin')) data.role = ROLES.ADMIN;
        }
        // Kiểm tra độ tuổi (>= 18)
        if (data.birthday) {
            const birthDate = new Date(data.birthday);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            if (age < 18) {
                return res.status(400).json({ message: 'Nhân sự phải đủ 18 tuổi hợp pháp' });
            }
        }

        // Quét trùng lặp CCCD/SĐT bên bảng Khách hàng
        if (data.phone || data.cccd) {
            const query = [];
            if (data.phone) query.push({ phone: data.phone });
            if (data.cccd) query.push({ cccd: data.cccd });
            if (query.length > 0) {
                const existingCustomer = await Customer.findOne({ $or: query });
                if (existingCustomer) {
                    return res.status(400).json({ message: 'Thông tin CCCD hoặc Số điện thoại đã được đăng ký (Khách hàng)' });
                }
            }
        }

        // 1. Tự sinh mã nhân viên và trạng thái
        data.ma_nhan_vien = await generateStaffId(data.role);
        data.trang_thai = 'Chờ kích hoạt';

        // 🌟 2. TỰ SINH EMAIL NỘI BỘ THEO ĐÚNG ROLE
        let domain = 'dentalcare.com';
        if (data.role === ROLES.DOCTOR) domain = 'BS.dentalcare.com';
        else if (data.role === ROLES.RECEPTIONIST) domain = 'LT.dentalcare.com';
        else if (data.role === ROLES.ADMIN) domain = 'AD.dentalcare.com';

        // Ép mã nhân viên thành chữ thường + @ + domain
        data.email_noi_bo = `${data.ma_nhan_vien.toLowerCase()}@${domain}`;

        // 3. Token bảo mật
        const resetToken = crypto.randomBytes(32).toString('hex');
        data.activationToken = resetToken;
        data.activationExpires = Date.now() + 24 * 60 * 60 * 1000;

        // 4. Lưu vào DB
        let newStaff;
        if (data.role === ROLES.ADMIN) newStaff = new Admin(data);
        else if (data.role === ROLES.DOCTOR) newStaff = new Doctor(data);
        else if (data.role === ROLES.RECEPTIONIST) newStaff = new Receptionist(data);
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
                email: data.email,
                subject: `[DentalCare] Thông tin tài khoản nội bộ - ${data.ma_nhan_vien}`,
                html: emailHtml
            });
            console.log(`✉️ ĐÃ GỬI EMAIL THÀNH CÔNG ĐẾN: ${data.email}`);
            console.log("📦 GÓI HÀNG FRONTEND GỬI LÊN LÀ:", data);
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

// --- 4. API KÍCH HOẠT NHÂN VIÊN ---
const activateStaff = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đủ token và mật khẩu mới' });
        }

        const user = await User.findOne({
            activationToken: token,
            activationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Liên kết kích hoạt không hợp lệ hoặc đã hết hạn. Vui lòng liên hệ Quản trị viên' });
        }

        // Kiểm tra độ mạnh mật khẩu (>= 8 ký tự, 1 hoa, 1 số, 1 ký tự đặc biệt)
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ message: 'Mật khẩu phải dài tối thiểu 8 ký tự, có ít nhất 1 chữ cái viết hoa, 1 chữ số và 1 ký tự đặc biệt' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        user.trang_thai = 'Đang hoạt động';
        user.activationToken = undefined;
        user.activationExpires = undefined;

        await user.save();

        return res.status(200).json({ message: 'Kích hoạt tài khoản thành công!' });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server khi kích hoạt', error: error.message });
    }
};

// --- 5. API ĐĂNG NHẬP ---
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

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        return res.status(200).json({
            message: 'Đăng nhập thành công',
            token,
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
// --- 6. API LẤY DANH SÁCH NHÂN VIÊN ĐỂ XẾP LỊCH (BR1.2.1) ---
const getStaffForScheduling = async (req, res) => {
    try {
        // Chỉ lấy nhân viên đang hoạt động, phục vụ cho việc phân ca
        const staffList = await User.find({
            trang_thai: 'Đang hoạt động',
            role: { $in: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST] } // Chỉ lấy các role có ca trực
        })
            .select('name role ma_nhan_vien') // Tối ưu hóa dữ liệu trả về
            .sort({ role: 1, name: 1 }); // Sắp xếp theo vai trò và tên

        return res.status(200).json(staffList);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách nhân sự để xếp lịch:", error);
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};
// --- 7. GỬI LẠI EMAIL KÍCH HOẠT (AF1.2.2) ---
const resendEmail = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy nhân sự' });

        if (user.trang_thai === 'Đang hoạt động') {
            return res.status(400).json({ message: 'Tài khoản này đã được kích hoạt, không thể gửi lại thư kích hoạt.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.activationToken = resetToken;
        user.activationExpires = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();

        const inviteLink = `http://localhost:5174/activate?token=${resetToken}&email=${user.email_noi_bo}`;
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
                <h2>Gửi lại liên kết kích hoạt</h2>
                <p>Xin chào <strong>${user.name}</strong>,</p>
                <p>Quản trị viên đã yêu cầu gửi lại liên kết kích hoạt cho bạn.</p>
                <a href="${inviteLink}" style="display: inline-block; padding: 12px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    KÍCH HOẠT TÀI KHOẢN
                </a>
            </div>
        `;

        await sendEmail({
            email: user.email,
            subject: `[DentalCare] Gửi lại thư kích hoạt - ${user.ma_nhan_vien}`,
            html: emailHtml
        });

        return res.status(200).json({ message: 'Đã gửi lại email kích hoạt thành công.' });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// --- 8. RESET MẬT KHẨU (AF1.2.3) ---
const resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy nhân sự' });

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.activationToken = resetToken;
        user.activationExpires = Date.now() + 24 * 60 * 60 * 1000;
        user.trang_thai = 'Chờ kích hoạt'; // Đưa về trạng thái chờ kích hoạt để bắt buộc đổi mật khẩu
        await user.save();

        const inviteLink = `http://localhost:5174/activate?token=${resetToken}&email=${user.email_noi_bo}`;
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
                <h2>Khôi phục mật khẩu</h2>
                <p>Xin chào <strong>${user.name}</strong>,</p>
                <p>Quản trị viên đã yêu cầu khôi phục mật khẩu cho tài khoản của bạn.</p>
                <a href="${inviteLink}" style="display: inline-block; padding: 12px 20px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    ĐẶT LẠI MẬT KHẨU
                </a>
            </div>
        `;

        await sendEmail({
            email: user.email,
            subject: `[DentalCare] Yêu cầu khôi phục mật khẩu - ${user.ma_nhan_vien}`,
            html: emailHtml
        });

        return res.status(200).json({ message: 'Đã gửi email khôi phục mật khẩu thành công. Tài khoản đã chuyển về trạng thái Chờ kích hoạt.' });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// --- 9. KIỂM TRA LỊCH LÀM VIÊC TRƯỚC KHI ĐÌNH CHỈ (Luồng 4) ---
const checkAppointments = async (req, res) => {
    try {
        const { id } = req.params; // Staff ID
        const affectedAppointments = await Appointment.find({ 
            doctor: id, 
            date: { $gte: new Date() }, 
            status: { $in: ['Scheduled', 'Confirmed', 'Rescheduled'] } 
        });
        
        return res.status(200).json({ 
            hasAppointments: affectedAppointments.length > 0,
            appointments: affectedAppointments 
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// --- 10. ĐÌNH CHỈ & BÀN GIAO CA (Luồng 4) ---
const reassignAndSuspend = async (req, res) => {
    try {
        const { id } = req.params;
        const { targetDoctorId } = req.body;
        
        if (targetDoctorId) {
            await Appointment.updateMany(
                { doctor: id, date: { $gte: new Date() }, status: { $in: ['Scheduled', 'Confirmed', 'Rescheduled'] } },
                { $set: { doctor: targetDoctorId } }
            );
        }
        
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy nhân sự' });
        
        user.trang_thai = 'Ngừng hoạt động';
        user.activationToken = undefined;
        user.activationExpires = undefined;
        await user.save();

        return res.status(200).json({ message: 'Đã đình chỉ nhân viên thành công' });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// These functions were correctly declared above.
// --- 11. KHÓA / MỞ KHÓA TÀI KHOẢN ---
const toggleLockStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy nhân sự' });

        if (user.trang_thai === 'Đang hoạt động') {
            user.trang_thai = 'Ngừng hoạt động'; // Bị đình chỉ
        } else {
            user.trang_thai = 'Đang hoạt động'; // Khôi phục
        }
        await user.save();
        return res.status(200).json({ message: 'Đã cập nhật trạng thái tài khoản' });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// --- 12. XÓA TÀI KHOẢN (SOFT DELETE) ---
const deleteStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy nhân sự' });
        
        user.trang_thai = 'Ngừng hoạt động'; // Soft delete
        await user.save();
        return res.status(200).json({ message: 'Đã xóa tài khoản thành công' });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

module.exports = {
    getAllStaff,
    createStaff,
    activateStaff,
    loginStaff,
    getStaffForScheduling,
    resendEmail,
    resetPassword,
    checkAppointments,
    reassignAndSuspend,
    toggleLockStaff,
    deleteStaff
};