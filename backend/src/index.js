const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const MOCK_STAFF = [
  {
    id: 'NV001',
    fullName: 'Nguyễn Văn An',
    email: 'nguyenvanan@dentalcare.vn',
    phone: '0901234567',
    role: 'admin',
    degree: null,
    status: 'active',
    createdAt: '2024-01-15',
    dob: '1990-03-15',
    gender: 'male',
    idNumber: '001090001234',
    address: 'Hà Nội',
    workplace: 'DentalCare HQ',
    username: 'nguyenvanan',
    startDate: '2024-01-15',
  },
  {
    id: 'BS001',
    fullName: 'Trần Thị Bình',
    email: 'tranthibinh@dentalcare.vn',
    phone: '0912345678',
    role: 'doctor',
    degree: 'Bác sĩ Răng Hàm Mặt',
    status: 'active',
    createdAt: '2024-02-20',
    dob: '1988-07-22',
    gender: 'female',
    idNumber: '001088007222',
    address: 'TP. Hồ Chí Minh',
    workplace: 'Phòng khám 1',
    username: 'tranthibinh',
    startDate: '2024-02-20',
  },
  {
    id: 'BS002',
    fullName: 'Lê Minh Cường',
    email: 'leminhcuong@dentalcare.vn',
    phone: '0923456789',
    role: 'doctor',
    degree: 'Thạc sĩ Nha khoa',
    status: 'active',
    createdAt: '2024-03-10',
    dob: '1985-11-01',
    gender: 'male',
    idNumber: '001085011001',
    address: 'Đà Nẵng',
    workplace: 'Phòng khám 2',
    username: 'leminhcuong',
    startDate: '2024-03-10',
  },
  {
    id: 'LT001',
    fullName: 'Phạm Thu Dung',
    email: 'phamthudung@dentalcare.vn',
    phone: '0934567890',
    role: 'receptionist',
    degree: null,
    status: 'locked',
    createdAt: '2024-04-05',
    dob: '1995-05-18',
    gender: 'female',
    idNumber: '001095005518',
    address: 'Hải Phòng',
    workplace: 'Quầy lễ tân',
    username: 'phamthudung',
    startDate: '2024-04-05',
  },
  {
    id: 'NV002',
    fullName: 'Hoàng Văn Em',
    email: 'hoangvanem@dentalcare.vn',
    phone: '0945678901',
    role: 'receptionist',
    degree: null,
    status: 'active',
    createdAt: '2024-05-12',
    dob: '1992-09-09',
    gender: 'male',
    idNumber: '001092009009',
    address: 'Cần Thơ',
    workplace: 'Quầy lễ tân',
    username: 'hoangvanem',
    startDate: '2024-05-12',
  },
  {
    id: 'BS003',
    fullName: 'Võ Thị Phương',
    email: 'vothiphuong@dentalcare.vn',
    phone: '0956789012',
    role: 'doctor',
    degree: 'Bác sĩ Răng Hàm Mặt',
    status: 'active',
    createdAt: '2024-06-01',
    dob: '1987-12-30',
    gender: 'female',
    idNumber: '001087123001',
    address: 'Nha Trang',
    workplace: 'Phòng khám 1',
    username: 'vothiphuong',
    startDate: '2024-06-01',
  },
  {
    id: 'NV003',
    fullName: 'Đặng Quốc Huy',
    email: 'dangquochuy@dentalcare.vn',
    phone: '0967890123',
    role: 'admin',
    degree: null,
    status: 'locked',
    createdAt: '2024-07-18',
    dob: '1989-04-04',
    gender: 'male',
    idNumber: '001089004004',
    address: 'Huế',
    workplace: 'DentalCare HQ',
    username: 'dangquochuy',
    startDate: '2024-07-18',
  },
  {
    id: 'LT002',
    fullName: 'Bùi Mai Lan',
    email: 'buimailan@dentalcare.vn',
    phone: '0978901234',
    role: 'receptionist',
    degree: null,
    status: 'active',
    createdAt: '2024-08-22',
    dob: '1996-01-25',
    gender: 'female',
    idNumber: '001096001525',
    address: 'Vũng Tàu',
    workplace: 'Quầy lễ tân',
    username: 'buimailan',
    startDate: '2024-08-22',
  },
];

function normalize(str) {
  return (str || '').toLowerCase().trim();
}

function normalizePhone(phone) {
  return (phone || '').replace(/\s/g, '');
}

function findStaffById(id) {
  return MOCK_STAFF.find((s) => s.id === id);
}

function filterStaff(list, { search, role, status }) {
  const q = normalize(search);
  return list.filter((s) => {
    if (!status && s.status === 'inactive') return false;
    if (role && s.role !== role) return false;
    if (status && s.status !== status) return false;
    if (!q) return true;
    const haystack = [s.id, s.fullName, s.email, s.phone, s.idNumber]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

function generateStaffId(role) {
  const prefix = role === 'doctor' ? 'BS' : role === 'receptionist' ? 'LT' : 'NV';
  const samePrefix = MOCK_STAFF.filter((s) => s.id.startsWith(prefix));
  let max = 0;
  for (const s of samePrefix) {
    const num = parseInt(s.id.replace(/\D/g, ''), 10);
    if (!Number.isNaN(num) && num > max) max = num;
  }
  return `${prefix}${String(max + 1).padStart(3, '0')}`;
}

function findDuplicate(body, excludeId = null) {
  const phone = normalizePhone(body.phone);
  const email = normalize(body.email);
  const idNumber = (body.idNumber || '').trim();

  const others = MOCK_STAFF.filter((s) => s.id !== excludeId);

  if (idNumber && others.some((s) => s.idNumber === idNumber)) {
    return {
      message: 'Số CCCD hoặc Số điện thoại đã được đăng ký trên hệ thống',
      fields: { idNumber: 'CCCD/CMND đã tồn tại trên hệ thống' },
    };
  }
  if (phone && others.some((s) => normalizePhone(s.phone) === phone)) {
    return {
      message: 'Số CCCD hoặc Số điện thoại đã được đăng ký trên hệ thống',
      fields: { phone: 'Số điện thoại đã được đăng ký trên hệ thống' },
    };
  }
  if (email && others.some((s) => normalize(s.email) === email)) {
    return {
      message: 'Email đã được đăng ký trên hệ thống',
      fields: { email: 'Email đã tồn tại trên hệ thống' },
    };
  }
  return null;
}

function buildStaffFromBody(body, existing = null) {
  const role = body.role || existing?.role || 'receptionist';
  return {
    id: existing?.id || generateStaffId(role),
    fullName: body.fullName?.trim(),
    email: body.email?.trim(),
    phone: body.phone?.trim(),
    role,
    degree: body.degree?.trim() || null,
    status: body.status || existing?.status || 'active',
    createdAt: existing?.createdAt || body.startDate || new Date().toISOString().slice(0, 10),
    dob: body.dob,
    gender: body.gender,
    idNumber: body.idNumber?.trim(),
    address: body.address?.trim(),
    workplace: body.workplace?.trim() || null,
    username: body.username?.trim(),
    startDate: body.startDate || existing?.startDate,
  };
}

// --- Routes (order matters) ---

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, routes: ['GET/POST /api/staffs', 'GET/PATCH/DELETE /api/staffs/:id'] });
});

app.get('/api/staffs', (req, res) => {
  const search = req.query.search || '';
  const role = req.query.role || '';
  const status = req.query.status || '';
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(500, Math.max(1, parseInt(req.query.limit, 10) || 10));

  const filtered = filterStaff(MOCK_STAFF, { search, role, status });
  const total = filtered.length;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  res.json({ data, total, page, limit });
});

app.get('/api/staffs/:id', (req, res) => {
  const staff = findStaffById(req.params.id);
  if (!staff) {
    return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
  }
  res.json({ data: staff });
});

app.post('/api/staffs', (req, res) => {
  const body = req.body || {};
  const duplicate = findDuplicate(body);
  if (duplicate) {
    return res.status(409).json(duplicate);
  }

  const newStaff = buildStaffFromBody(body);
  MOCK_STAFF.push(newStaff);
  res.status(201).json({
    data: newStaff,
    message: 'Thêm mới nhân viên thành công',
  });
});

app.patch('/api/staffs/:id', (req, res) => {
  const index = MOCK_STAFF.findIndex((s) => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
  }

  const body = req.body || {};
  const duplicate = findDuplicate(body, req.params.id);
  if (duplicate) {
    return res.status(409).json(duplicate);
  }

  const updated = buildStaffFromBody(body, MOCK_STAFF[index]);
  MOCK_STAFF[index] = updated;
  res.json({
    data: updated,
    message: 'Cập nhật thông tin nhân viên thành công',
  });
});

app.patch('/api/staffs/:id/lock', (req, res) => {
  const staff = findStaffById(req.params.id);
  if (!staff) {
    return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
  }
  if (staff.status === 'inactive') {
    return res.status(400).json({ message: 'Không thể khóa tài khoản đã ngừng hoạt động' });
  }

  staff.status = staff.status === 'locked' ? 'active' : 'locked';
  res.json({
    data: staff,
    message: staff.status === 'locked' ? 'Đã tạm khóa tài khoản' : 'Đã mở khóa tài khoản',
  });
});

app.delete('/api/staffs/:id', (req, res) => {
  const staff = findStaffById(req.params.id);
  if (!staff) {
    return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
  }

  staff.status = 'inactive';
  res.json({
    data: staff,
    message: 'Đã chuyển tài khoản sang trạng thái Ngưng hoạt động',
  });
});

app.use('/api', (_req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
  console.log('Staff routes: GET/POST /api/staffs | GET/PATCH/DELETE /api/staffs/:id | PATCH lock');
});
