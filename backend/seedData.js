require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const Staff = require('./src/models/Staff');
const Customer = require('./src/models/Customer');

if (!process.env.MONGODB_URI) {
  console.error('Missing MONGODB_URI in .env file');
  process.exit(1);
}

// Function to generate Vietnamese names
function getRandomVietnameseName() {
  const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
  const middleNames = ['Văn', 'Thị', 'Hữu', 'Đức', 'Thành', 'Minh', 'Ngọc', 'Hải', 'Xuân', 'Thu', 'Thanh', 'Khánh'];
  const firstNames = ['An', 'Anh', 'Bảo', 'Bình', 'Châu', 'Chi', 'Cường', 'Dương', 'Đạt', 'Duy', 'Giang', 'Hà', 'Hải', 'Hiếu', 'Hòa', 'Huy', 'Khoa', 'Khôi', 'Kiên', 'Lâm', 'Lan', 'Linh', 'Long', 'Mai', 'Nam', 'Nga', 'Ngân', 'Nghĩa', 'Ngọc', 'Nhi', 'Nhung', 'Phát', 'Phong', 'Phú', 'Phương', 'Quân', 'Quang', 'Quyên', 'Tâm', 'Thảo', 'Thắng', 'Thành', 'Thủy', 'Tiến', 'Trang', 'Trí', 'Trúc', 'Tú', 'Tuấn', 'Uyên', 'Vân', 'Việt', 'Vinh', 'Vy', 'Yến'];

  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const middleName = middleNames[Math.floor(Math.random() * middleNames.length)];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];

  return `${lastName} ${middleName} ${firstName}`;
}

function getRandomPhone() {
  return `09${Math.floor(10000000 + Math.random() * 90000000)}`;
}

function getRandomCCCD() {
  return `0${Math.floor(10000000000 + Math.random() * 90000000000)}`;
}

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Clear existing
    console.log('Clearing existing Staff and Customers (except admin)...');
    await Customer.deleteMany({});
    await Staff.deleteMany({ role: { $ne: 'admin' } });

    // Seed 60 Customers
    const customers = [];
    for (let i = 1; i <= 60; i++) {
      customers.push({
        id: `KH${String(i).padStart(3, '0')}`,
        name: getRandomVietnameseName(),
        dateOfBirth: new Date(1960 + Math.floor(Math.random() * 40), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        phone: getRandomPhone(),
        cccd: getRandomCCCD(),
        address: `123 Đường ${i}, Quận ${Math.floor(Math.random() * 12) + 1}, TP.HCM`,
        email: `khachhang${i}@gmail.com`,
        status: 'active'
      });
    }
    await Customer.insertMany(customers);
    console.log(`Seeded 60 Customers`);

    // Seed 60 Staff
    const staffs = [];
    const roles = ['doctor', 'receptionist', 'nurse', 'admin'];
    const departments = ['Khoa Khám Bệnh', 'Khoa Phục Hình', 'Khoa Chẩn Đoán Hình Ảnh', 'Khoa Xét Nghiệm', 'Ban Quản Trị'];
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Dentalcare@123', salt);

    for (let i = 1; i <= 60; i++) {
      let status = 'active';
      // Put exactly 2 staff in pending/inactive
      if (i === 1) status = 'pending';
      if (i === 2) status = 'inactive';

      const role = roles[Math.floor(Math.random() * roles.length)];
      const department = departments[Math.floor(Math.random() * departments.length)];

      staffs.push({
        id: `NV${String(i).padStart(3, '0')}`,
        fullName: getRandomVietnameseName(),
        gender: Math.random() > 0.5 ? 'male' : 'female',
        idNumber: getRandomCCCD(),
        address: `456 Đường ${i}, Quận ${Math.floor(Math.random() * 12) + 1}, TP.HCM`,
        phone: getRandomPhone(),
        personalEmail: `nhanvien${i}@gmail.com`,
        email: `nv${i}@dentalcare.com`,
        password: hashedPassword,
        role: role,
        department: department,
        specialty: role === 'doctor' ? 'Răng Hàm Mặt' : null,
        startDate: new Date(),
        status: status,
        username: `nv${i}`
      });
    }
    await Staff.insertMany(staffs);
    console.log(`Seeded 60 Staff`);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
