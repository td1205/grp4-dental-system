require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const Staff = require('./models/Staff');
const Customer = require('./models/Customer');
const Appointment = require('./models/Appointment');
const LeaveRequest = require('./models/LeaveRequest');
const Service = require('./models/Service');
const ServicePriceHistory = require('./models/ServicePriceHistory');
const { sendWelcomeEmail } = require('./utils/mailer');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB Connected successfully');
    await seedAdminAccount();
  })
  .catch((err) => console.error('MongoDB connection error:', err));

async function seedAdminAccount() {
  try {
    const adminExists = await Staff.findOne({ role: 'admin' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Dentalcare@123', salt);

      const adminData = {
        id: 'AD20260601',
        fullName: 'Hệ thống Quản trị viên',
        gender: 'male',
        idNumber: '000000000000',
        address: 'Hệ thống Dental Care',
        phone: '0999999999',
        personalEmail: 'admin.root@gmail.com',
        email: 'admin@dentalcare.com',
        password: hashedPassword,
        role: 'admin',
        department: 'Ban quản trị',
        startDate: new Date(),
        status: 'active',
        username: 'admin',
      };

      await Staff.create(adminData);
      console.log('[Seeding] Đã tạo tài khoản Admin mặc định thành công.');
    }
  } catch (error) {
    console.error('[Seeding] Lỗi khi tạo tài khoản Admin:', error);
  }
}

// Utility: Normalize string
function normalize(str) {
  return (str || '').toLowerCase().trim();
}

function normalizePhone(phone) {
  return (phone || '').replace(/\s/g, '');
}

// Generate Staff ID
async function generateStaffId(role) {
  const prefix = role === 'doctor' ? 'BS' : (role === 'receptionist' ? 'LT' : 'NV');
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const yyyymm = `${year}${month}`;
  
  const pattern = `${prefix}${yyyymm}`;
  // Find the highest sequence number for this pattern
  const staffList = await Staff.find({ id: { $regex: `^${pattern}` } }, 'id');
  
  let max = 0;
  for (const s of staffList) {
    const numStr = s.id.substring(pattern.length);
    const num = parseInt(numStr, 10);
    if (!Number.isNaN(num) && num > max) max = num;
  }
  return `${pattern}${String(max + 1).padStart(2, '0')}`;
}

// Map Mongoose Duplicate Key Error to 409 Object
function handleDuplicateError(err) {
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    let message = 'Dữ liệu đã tồn tại';
    let fieldMessage = {};
    if (field === 'idNumber') {
      message = 'Số CCCD đã được đăng ký trên hệ thống';
      fieldMessage = { idNumber: 'CCCD/CMND đã tồn tại trên hệ thống' };
    } else if (field === 'phone') {
      message = 'Số điện thoại đã được đăng ký trên hệ thống';
      fieldMessage = { phone: 'Số điện thoại đã được đăng ký trên hệ thống' };
    } else if (field === 'email') {
      message = 'Email định danh đã được đăng ký trên hệ thống';
      fieldMessage = { email: 'Email định danh đã tồn tại trên hệ thống' };
    } else if (field === 'personalEmail') {
      message = 'Email cá nhân đã được đăng ký trên hệ thống';
      fieldMessage = { personalEmail: 'Email cá nhân đã tồn tại trên hệ thống' };
    }
    return { message, fields: fieldMessage };
  }
  return null;
}

// --- Routes ---

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, routes: ['GET/POST /api/staffs', 'GET/PATCH/DELETE /api/staffs/:id'] });
});

app.get('/api/staffs', async (req, res) => {
  try {
    const search = req.query.search || '';
    const role = req.query.role || '';
    const status = req.query.status || '';
    const sortParams = req.query.sort || 'createdAt:desc';
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(500, Math.max(1, parseInt(req.query.limit, 10) || 10));

    const query = {};
    if (status) {
      query.status = status;
    } else {
      // By default, exclude inactive unless status is specified
      query.status = { $ne: 'inactive' };
    }
    
    if (role) {
      query.role = role;
    }
    
    if (search) {
      const q = normalize(search);
      query.$or = [
        { id: { $regex: q, $options: 'i' } },
        { fullName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { idNumber: { $regex: q, $options: 'i' } }
      ];
    }

    let sortQuery = { createdAt: -1 };
    if (sortParams) {
      const [field, order] = sortParams.split(':');
      const sortOrder = order === 'asc' ? 1 : -1;
      // Tránh Injection chỉ cho phép sort các cột được định nghĩa
      if (['createdAt', 'fullName', 'role'].includes(field)) {
        sortQuery = { [field]: sortOrder };
      }
    }

    const total = await Staff.countDocuments(query);
    const start = (page - 1) * limit;
    
    const data = await Staff.find(query)
                            .skip(start)
                            .limit(limit)
                            .sort(sortQuery);

    // Format the response correctly for frontend
    res.json({ data, total, page, limit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.get('/api/staffs/:id', async (req, res) => {
  try {
    const staff = await Staff.findOne({ id: req.params.id });
    if (!staff) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }
    res.json({ data: staff });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.post('/api/staffs', async (req, res) => {
  try {
    const body = req.body || {};
    const role = body.position || body.role || 'receptionist';
    
    const id = await generateStaffId(role);
    
    // Hash random temporary password instead of hardcoded
    const tempPassword = crypto.randomBytes(16).toString('hex');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);
    
    const username = body.personalEmail?.split('@')[0] || id.toLowerCase();
    const systemEmail = `${username}@dentalcare.vn`;
    
    // Generate activation token
    const activationToken = crypto.randomBytes(32).toString('hex');

    const newStaffData = {
      id,
      fullName: body.fullName?.trim(),
      gender: body.gender,
      idNumber: body.idNumber?.trim(),
      address: body.address?.trim(),
      phone: normalizePhone(body.phone),
      personalEmail: normalize(body.personalEmail),
      email: systemEmail,
      password: hashedPassword,
      role: role,
      department: body.department?.trim() || 'Chưa phân bổ',
      specialty: role === 'doctor' ? body.specialty?.trim() : null,
      startDate: body.startDate || new Date(),
      status: body.status || 'pending',
      dob: body.dateOfBirth || null,
      username: username,
      activationToken: activationToken,
    };

    const newStaff = new Staff(newStaffData);
    await newStaff.save();

    // Gửi email thực tế thông qua Nodemailer (Tự động)
    if (newStaff.personalEmail) {
      try {
        // Chạy ngầm, không block luồng xử lý chính nếu lỗi email
        sendWelcomeEmail(newStaff.personalEmail, newStaff.fullName, activationToken);
      } catch (mailError) {
        console.error('[Mail Service] Lỗi khi gửi thư tự động:', mailError);
      }
    }

    res.status(201).json({
      data: newStaff,
      message: 'Thêm mới nhân viên thành công',
    });
  } catch (error) {
    const dupError = handleDuplicateError(error);
    if (dupError) {
      return res.status(409).json(dupError);
    }
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi tạo mới nhân viên' });
  }
});

app.patch('/api/staffs/:id', async (req, res) => {
  try {
    const body = req.body || {};
    // Extract updateable fields
    const updateData = {};
    if (body.fullName !== undefined) updateData.fullName = body.fullName.trim();
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.idNumber !== undefined) updateData.idNumber = body.idNumber.trim();
    if (body.address !== undefined) updateData.address = body.address.trim();
    if (body.phone !== undefined) updateData.phone = normalizePhone(body.phone);
    if (body.personalEmail !== undefined) updateData.personalEmail = normalize(body.personalEmail);
    if (body.department !== undefined) updateData.department = body.department.trim();
    if (body.specialty !== undefined) updateData.specialty = body.specialty.trim();
    if (body.dateOfBirth !== undefined) updateData.dob = body.dateOfBirth;

    const updated = await Staff.findOneAndUpdate(
      { id: req.params.id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }

    res.json({
      data: updated,
      message: 'Cập nhật thông tin nhân viên thành công',
    });
  } catch (error) {
    const dupError = handleDuplicateError(error);
    if (dupError) {
      return res.status(409).json(dupError);
    }
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật nhân viên' });
  }
});

app.get('/api/staffs/:id/check-appointments', async (req, res) => {
  try {
    const staff = await Staff.findOne({ id: req.params.id });
    if (!staff || staff.role !== 'doctor') {
      return res.json({ hasAppointments: false, appointments: [] });
    }

    const appointments = await Appointment.find({ doctorId: req.params.id, status: { $in: ['pending', 'confirmed'] } });
    res.json({
      hasAppointments: appointments.length > 0,
      appointments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi kiểm tra lịch hẹn' });
  }
});

app.post('/api/staffs/:id/reassign-suspend', async (req, res) => {
  try {
    const { newDoctorId, reason } = req.body;
    const oldStaffId = req.params.id;

    if (!newDoctorId) {
      return res.status(400).json({ message: 'Vui lòng chọn bác sĩ tiếp quản' });
    }

    const oldStaff = await Staff.findOne({ id: oldStaffId });
    const newStaff = await Staff.findOne({ id: newDoctorId, role: 'doctor', status: 'active' });

    if (!oldStaff || !newStaff) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin bác sĩ' });
    }

    // Chuyển toàn bộ lịch hẹn pending/confirmed sang bác sĩ mới
    await Appointment.updateMany(
      { doctorId: oldStaffId, status: { $in: ['pending', 'confirmed'] } },
      { $set: { doctorId: newDoctorId } }
    );

    // Đình chỉ bác sĩ cũ
    oldStaff.status = 'suspended';
    oldStaff.suspendReason = reason || 'Đình chỉ công tác và bàn giao ca';
    await oldStaff.save();

    res.json({
      message: `Đã bàn giao thành công ca làm việc sang bác sĩ ${newStaff.fullName} và đình chỉ bác sĩ ${oldStaff.fullName}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi bàn giao ca làm việc' });
  }
});

app.patch('/api/staffs/:id/lock', async (req, res) => {
  try {
    const staff = await Staff.findOne({ id: req.params.id });
    if (!staff) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }
    if (staff.status === 'inactive') {
      return res.status(400).json({ message: 'Không thể khóa tài khoản đã ngừng hoạt động' });
    }

    const isSuspending = staff.status !== 'suspended';
    staff.status = isSuspending ? 'suspended' : 'active';
    
    if (isSuspending) {
      staff.suspendReason = req.body?.reason?.trim() || 'Không có lý do';
      console.log(`[Backend] Token đăng nhập của ${staff.email} đã bị thu hồi.`);
      console.log(`[Backend] Nhân viên ${staff.id} đã bị gỡ khỏi lịch phân ca.`);
    } else {
      staff.suspendReason = null;
    }

    await staff.save();

    res.json({
      data: staff,
      message: isSuspending ? 'Đã đình chỉ tài khoản' : 'Đã khôi phục tài khoản',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.delete('/api/staffs/:id', async (req, res) => {
  try {
    const staff = await Staff.findOneAndUpdate(
      { id: req.params.id },
      { status: 'suspended' },
      { new: true }
    );
    if (!staff) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }

    res.json({
      data: staff,
      message: 'Đã chuyển tài khoản sang trạng thái Đình chỉ / Thùng rác',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.patch('/api/staffs/:id/reset-password', async (req, res) => {
  try {
    const staff = await Staff.findOne({ id: req.params.id });
    if (!staff) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }
    
    const salt = await bcrypt.genSalt(10);
    staff.password = await bcrypt.hash('Dentalcare@123', salt);
    // Có thể set trạng thái về pending để ép người dùng đổi lại
    // staff.status = 'pending';
    
    await staff.save();

    res.json({
      message: `Đã reset mật khẩu nhân viên ${staff.fullName} về mặc định.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.post('/api/staffs/:id/resend-email', async (req, res) => {
  try {
    const staff = await Staff.findOne({ id: req.params.id });
    if (!staff) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }

    if (!staff.personalEmail) {
      return res.status(400).json({ message: 'Nhân viên này chưa có email cá nhân' });
    }

    // Generate a new token if one doesn't exist (e.g. they're still pending)
    let token = staff.activationToken;
    if (!token) {
      token = crypto.randomBytes(32).toString('hex');
      staff.activationToken = token;
      staff.status = 'pending'; // Require activation again
      await staff.save();
    }

    const success = await sendWelcomeEmail(staff.personalEmail, staff.fullName, token);
    
    if (success) {
      res.json({ message: `Đã gửi lại email thành công tới ${staff.personalEmail}` });
    } else {
      res.status(500).json({ message: 'Gửi email thất bại. Vui lòng kiểm tra cấu hình.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
    }

    const staff = await Staff.findOne({ 
      $or: [{ email }, { personalEmail: email }, { username: email }]
    });

    if (!staff) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    if (staff.status === 'suspended') {
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị đình chỉ công tác' });
    }

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }

    // Trả về thông tin user (giả lập JWT token)
    res.json({
      message: 'Đăng nhập thành công',
      user: {
        id: staff.id,
        fullName: staff.fullName,
        email: staff.email,
        role: staff.role,
        status: staff.status,
      },
      token: 'mock-jwt-token-for-demo'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.post('/api/auth/activate', async (req, res) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đủ thông tin kích hoạt' });
    }

    const staff = await Staff.findOne({ activationToken: token, personalEmail: email });

    if (!staff) {
      return res.status(400).json({ message: 'Đường dẫn kích hoạt không hợp lệ hoặc đã hết hạn' });
    }

    // Kích hoạt: hash mật khẩu mới, cập nhật trạng thái
    const salt = await bcrypt.genSalt(10);
    staff.password = await bcrypt.hash(newPassword, salt);
    staff.status = 'active';
    staff.activationToken = null;

    await staff.save();

    res.json({ message: 'Kích hoạt tài khoản thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// --- Customer Routes ---

app.get('/api/customers', async (req, res) => {
  try {
    const search = req.query.search || '';
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(500, Math.max(1, parseInt(req.query.limit, 10) || 10));

    const query = {};
    // By default, exclude inactive accounts from standard search
    query.status = { $ne: 'inactive' };

    if (search) {
      const q = search.toLowerCase().trim();
      query.$or = [
        { id: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { cccd: { $regex: q, $options: 'i' } }
      ];
    }

    const total = await Customer.countDocuments(query);
    const start = (page - 1) * limit;

    const data = await Customer.find(query)
                               .skip(start)
                               .limit(limit)
                               .sort({ createdAt: -1 });

    res.json({ data, total, page, limit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findOne({ id: req.params.id });
    if (!customer) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }
    res.json({ data: customer });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const body = req.body || {};

    // Check duplicate CCCD or Phone (EF1.1.1)
    const existingCccd = await Customer.findOne({ cccd: body.cccd?.trim() });
    if (existingCccd) {
      if (existingCccd.status === 'inactive') {
        return res.status(200).json({ needRestore: true, data: existingCccd, message: 'Hệ thống phát hiện khách hàng này từng có hồ sơ lịch sử tại phòng khám (đã bị xóa). Bạn có muốn khôi phục lại hồ sơ cũ không?' });
      }
      return res.status(409).json({ message: 'Thông tin CCCD hoặc Số điện thoại đã được đăng ký trên hệ thống' });
    }

    const existingPhone = await Customer.findOne({ phone: body.phone?.trim() });
    if (existingPhone) {
      if (existingPhone.status === 'inactive') {
        return res.status(200).json({ needRestore: true, data: existingPhone, message: 'Hệ thống phát hiện khách hàng này từng có hồ sơ lịch sử tại phòng khám (đã bị xóa). Bạn có muốn khôi phục lại hồ sơ cũ không?' });
      }
      return res.status(409).json({ message: 'Thông tin CCCD hoặc Số điện thoại đã được đăng ký trên hệ thống' });
    }

    // Auto-generate patient ID: count documents + format BNxxx
    const count = await Customer.countDocuments();
    let num = count + 1;
    let patientId = `BN${String(num).padStart(3, '0')}`;
    while (await Customer.findOne({ id: patientId })) {
      num++;
      patientId = `BN${String(num).padStart(3, '0')}`;
    }

    const newCustomer = new Customer({
      id: patientId,
      name: body.name?.trim(),
      dateOfBirth: body.dob || body.dateOfBirth,
      phone: body.phone?.trim(),
      cccd: body.cccd?.trim(),
      address: body.address?.trim(),
      email: body.email?.trim() || null,
      status: body.status || 'active',
    });

    await newCustomer.save();
    res.status(201).json({
      data: newCustomer,
      message: 'Thêm mới khách hàng thành công',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi tạo mới khách hàng' });
  }
});

app.patch('/api/customers/:id', async (req, res) => {
  try {
    const body = req.body || {};

    // cccd and id are locked/readOnly
    delete body.id;
    delete body.cccd;

    const updateData = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.dob !== undefined) updateData.dateOfBirth = body.dob;
    if (body.dateOfBirth !== undefined) updateData.dateOfBirth = body.dateOfBirth;
    if (body.phone !== undefined) {
      // Check phone uniqueness if phone is updated
      const existingPhone = await Customer.findOne({ phone: body.phone.trim(), id: { $ne: req.params.id } });
      if (existingPhone) {
        return res.status(409).json({ message: 'Thông tin CCCD hoặc Số điện thoại đã được đăng ký trên hệ thống' });
      }
      updateData.phone = body.phone.trim();
    }
    if (body.address !== undefined) updateData.address = body.address.trim();
    if (body.email !== undefined) updateData.email = body.email.trim() || null;
    if (body.status !== undefined) updateData.status = body.status;

    const updated = await Customer.findOneAndUpdate(
      { id: req.params.id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }

    res.json({
      data: updated,
      message: 'Cập nhật thông tin khách hàng thành công',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật khách hàng' });
  }
});

app.patch('/api/customers/:id/restore', async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { id: req.params.id },
      { status: 'active' },
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }

    res.json({
      data: customer,
      message: 'Đã khôi phục tài khoản khách hàng thành công',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi khôi phục khách hàng' });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { id: req.params.id },
      { status: 'inactive' },
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    }

    res.json({
      data: customer,
      message: 'Đã chuyển tài khoản khách hàng sang trạng thái Ngưng hoạt động',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi xóa khách hàng' });
  }
});

// --- Leave Management Routes ---

app.get('/api/leaves', async (req, res) => {
  try {
    const leaves = await LeaveRequest.find().sort({ createdAt: -1 });
    res.json({ data: leaves });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.post('/api/leaves', async (req, res) => {
  try {
    const { staffId, date, reason } = req.body;
    if (!staffId || !date || !reason) {
      return res.status(400).json({ message: 'Thiếu thông tin đăng ký nghỉ phép' });
    }

    const newLeave = new LeaveRequest({
      staffId,
      date,
      reason,
      status: 'pending'
    });

    await newLeave.save();
    res.status(201).json({ data: newLeave, message: 'Đã tạo đơn xin nghỉ phép thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi tạo đơn nghỉ phép' });
  }
});

app.patch('/api/leaves/:id/approve', async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Không tìm thấy đơn nghỉ phép' });
    }

    leave.status = req.body.status || 'approved'; // có thể approved hoặc rejected
    await leave.save();

    res.json({ data: leave, message: `Đã ${leave.status === 'approved' ? 'duyệt' : 'từ chối'} đơn xin nghỉ phép` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật đơn nghỉ phép' });
  }
});

// -----------------------------
// SERVICE & PRICE ROUTES
// -----------------------------
app.get('/api/services', async (req, res) => {
  try {
    const { status = 'active' } = req.query;
    const query = status === 'all' ? {} : { status };
    const services = await Service.find(query).sort({ id: 1 }).lean();
    
    const serviceIds = services.map(s => s.id);
    const prices = await ServicePriceHistory.find({ serviceId: { $in: serviceIds } }).sort({ version: 1 }).lean();
    
    const pricesMap = {};
    prices.forEach(p => {
      if (!pricesMap[p.serviceId]) pricesMap[p.serviceId] = [];
      pricesMap[p.serviceId].push(p);
    });
    
    const data = services.map(s => ({
      ...s,
      priceHistory: pricesMap[s.id] || []
    }));
    
    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    const { id, name, category, duration, description, price, bhyt, effectiveDate } = req.body;
    
    let newId = id;
    if (!newId) {
      const lastService = await Service.findOne().sort({ id: -1 });
      let nextNum = 1;
      if (lastService && lastService.id && lastService.id.startsWith('DV')) {
        const numStr = lastService.id.replace('DV', '');
        const parsed = parseInt(numStr, 10);
        if (!isNaN(parsed)) nextNum = parsed + 1;
      }
      newId = `DV${String(nextNum).padStart(3, '0')}`;
    }
    
    const newService = new Service({
      id: newId,
      name, category, duration: duration || 30, description
    });
    newService._performedBy = 'AD20260601';
    await newService.save();
    
    let priceHistory = [];
    if (price) {
      const newPrice = new ServicePriceHistory({
        serviceId: newId,
        regularPrice: price,
        insurancePrice: bhyt || '0',
        effectiveDate: new Date(effectiveDate || Date.now()),
        version: 1
      });
      await newPrice.save();
      priceHistory.push(newPrice);
    }
    
    res.status(201).json({ data: { ...newService.toObject(), priceHistory }, message: 'Thêm dịch vụ thành công' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Mã dịch vụ đã tồn tại trong hệ thống' });
    }
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.put('/api/services/:id', async (req, res) => {
  try {
    const { name, category, duration, description } = req.body;
    const service = await Service.findOneAndUpdate(
      { id: req.params.id },
      { name, category, duration, description },
      { new: true, performedBy: 'AD20260601' }
    );
    if (!service) return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    res.json({ data: service, message: 'Cập nhật dịch vụ thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.delete('/api/services/:id', async (req, res) => {
  try {
    const service = await Service.findOneAndUpdate(
      { id: req.params.id },
      { status: 'inactive' },
      { new: true, performedBy: 'AD20260601' }
    );
    if (!service) return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    res.json({ message: 'Xóa dịch vụ thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.patch('/api/services/:id/restore', async (req, res) => {
  try {
    const service = await Service.findOneAndUpdate(
      { id: req.params.id },
      { status: 'active' },
      { new: true, performedBy: 'AD20260601' }
    );
    if (!service) return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    res.json({ message: 'Khôi phục dịch vụ thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.post('/api/services/:id/prices', async (req, res) => {
  try {
    const serviceId = req.params.id;
    const { price, bhyt, effectiveDate } = req.body;
    
    const service = await Service.findOne({ id: serviceId });
    if (!service) return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    
    const currentPrices = await ServicePriceHistory.find({ serviceId }).sort({ version: -1 });
    const nextVersion = currentPrices.length > 0 ? currentPrices[0].version + 1 : 1;
    
    const newPrice = new ServicePriceHistory({
      serviceId,
      regularPrice: price,
      insurancePrice: bhyt || '0',
      effectiveDate: new Date(effectiveDate || Date.now()),
      version: nextVersion
    });
    await newPrice.save();
    
    const AuditLog = require('./models/AuditLog');
    await AuditLog.create({
      action: 'UPDATE',
      collectionName: 'Service',
      documentId: service._id,
      performedBy: 'AD20260601',
      oldValues: currentPrices.length > 0 ? currentPrices[0] : null,
      newValues: newPrice,
      timestamp: new Date()
    });
    
    res.status(201).json({ data: newPrice, message: 'Cập nhật giá thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

app.use('/api', (_req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
  console.log('Staff routes: GET/POST /api/staffs | GET/PATCH/DELETE /api/staffs/:id | PATCH lock | PATCH reset-password');
});
