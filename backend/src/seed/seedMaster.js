require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import all models
const User = require('../models/User');
const Customer = require('../models/Customer');
const Service = require('../models/Service');
const ServicePriceHistory = require('../models/ServicePriceHistory');
const Appointment = require('../models/Appointment');
const Shift = require('../models/Shift');
const Invoice = require('../models/Invoice');
const MedicalRecord = require('../models/MedicalRecord');
const Payslip = require('../models/Payslip');
const BaseSalary = require('../models/BaseSalary');
const ShiftCoefficient = require('../models/ShiftCoefficient');

if (!process.env.MONGODB_URI) {
  console.error('Missing MONGODB_URI in .env file');
  process.exit(1);
}

const DEMO_PASSWORD = 'Dentalcare2026@';

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected.');

    console.log('Step 1/8: Dropping existing collections...');
    const modelsToDrop = [User, Customer, Service, ServicePriceHistory, Appointment, Shift, Invoice, MedicalRecord, Payslip, BaseSalary, ShiftCoefficient];
    
    for (const model of modelsToDrop) {
      try {
        await model.collection.drop();
      } catch (err) {
        // Ignore "ns not found" errors
      }
    }

    console.log('Step 2/8: Seeding Users (Admin, Receptionists, Doctors)...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, salt);

    const defaultUserInfo = {
      address: 'TP.HCM',
      gender: 'Nam',
      birthday: new Date('1990-01-01')
    };

    // Admin
    const admin = await User.create({
      ma_nhan_vien: 'ADMIN001',
      name: 'Quản Trị Viên',
      email_noi_bo: 'admin@dentalcare.com',
      username: 'admin',
      password: hashedPassword,
      phone: '0900000000',
      role: 'Admin',
      trang_thai: 'Đang hoạt động',
      ...defaultUserInfo
    });

    // Receptionists
    const rec1 = await User.create({ ma_nhan_vien: 'REC001', name: 'Lễ tân 1', email_noi_bo: 'letan1@dentalcare.com', username: 'letan1', password: hashedPassword, phone: '0901111111', role: 'Receptionist', trang_thai: 'Đang hoạt động', ...defaultUserInfo });
    const rec2 = await User.create({ ma_nhan_vien: 'REC002', name: 'Lễ tân 2', email_noi_bo: 'letan2@dentalcare.com', username: 'letan2', password: hashedPassword, phone: '0902222222', role: 'Receptionist', trang_thai: 'Đang hoạt động', ...defaultUserInfo });

    // Doctors (Specific names from Mockup)
    const docs = [
      { ma_nhan_vien: 'DOC001', name: 'Nguyễn Văn Bình', email_noi_bo: 'binhnv@dentalcare.com', username: 'bsbinh', role: 'Doctor' },
      { ma_nhan_vien: 'DOC002', name: 'Trần Thị Kim Anh', email_noi_bo: 'anhttk@dentalcare.com', username: 'bskimanh', role: 'Doctor', gender: 'Nữ' },
      { ma_nhan_vien: 'DOC003', name: 'Phạm Quốc Huy', email_noi_bo: 'huypq@dentalcare.com', username: 'bshuy', role: 'Doctor' },
      { ma_nhan_vien: 'DOC004', name: 'Lê Minh Châu', email_noi_bo: 'chaulm@dentalcare.com', username: 'bschau', role: 'Doctor', gender: 'Nữ' }
    ];
    
    const createdDocs = [];
    for (const d of docs) {
      const docGender = d.gender || 'Nam';
      const doc = await User.create({ ...d, password: hashedPassword, phone: `091${Math.floor(1000000 + Math.random() * 9000000)}`, trang_thai: 'Đang hoạt động', department: 'Khoa Răng Hàm Mặt', address: 'TP.HCM', birthday: new Date('1985-01-01'), gender: docGender });
      createdDocs.push(doc);
    }

    console.log('Step 3/8: Seeding Customers...');
    const customers = [];
    for (let i = 1; i <= 10; i++) {
      customers.push({
        id: `KH${String(i).padStart(3, '0')}`,
        name: `Bệnh nhân ${i}`,
        phone: `098${Math.floor(1000000 + Math.random() * 9000000)}`,
        dateOfBirth: new Date(1980 + i, 5, 15),
        address: `Số ${i} Đường Demo, TP.HCM`,
        email: `bn${i}@gmail.com`,
        cccd: `079${Math.floor(100000000 + Math.random() * 900000000)}`,
        status: 'active'
      });
    }
    const createdCustomers = await Customer.insertMany(customers);

    console.log('Step 4/8: Seeding Services and Price History...');
    const servicesToCreate = [
      { id: 'SV01', name: 'Khám và tư vấn ban đầu', category: 'Khám tổng quát', duration: 30, status: 'active', price: '100000' },
      { id: 'SV02', name: 'Cạo vôi răng', category: 'Khám tổng quát', duration: 45, status: 'active', price: '300000' },
      { id: 'SV03', name: 'Nhổ răng khôn mọc thẳng', category: 'Nhổ răng', duration: 60, status: 'active', price: '1000000' },
      { id: 'SV04', name: 'Nhổ răng khôn mọc ngầm', category: 'Nhổ răng', duration: 90, status: 'active', price: '3000000' },
      { id: 'SV05', name: 'Trồng răng Implant', category: 'Phục hình thẩm mỹ', duration: 120, status: 'active', price: '15000000' }
    ];

    const services = [];
    for (const s of servicesToCreate) {
      const srv = await Service.create({
        id: s.id,
        name: s.name,
        category: s.category,
        duration: s.duration,
        status: s.status
      });
      const priceHistory = await ServicePriceHistory.create({
        serviceId: srv.id,
        regularPrice: s.price,
        insurancePrice: '0',
        effectiveDate: new Date('2024-01-01'),
        version: 1
      });
      srv.priceHistory = [priceHistory._id];
      await srv.save();
      services.push(srv);
    }

    console.log('Step 5/8: Seeding Salary Configuration...');
    await ShiftCoefficient.create({
      morningWeekday: 1.0, morningWeekend: 1.5, morningHoliday: 2.0,
      afternoonWeekday: 1.0, afternoonWeekend: 1.5, afternoonHoliday: 2.0,
      updatedBy: admin._id
    });

    const baseSalaries = [25000000, 36000000, 28000000, 17000000];
    const complexFactors = [1.2, 1.5, 1.3, 1.0];
    
    for (let i = 0; i < createdDocs.length; i++) {
      await BaseSalary.create({
        doctorId: createdDocs[i]._id,
        amount: baseSalaries[i],
        complexityFactor: complexFactors[i],
        effectiveDate: new Date('2024-01-01'),
        createdBy: admin._id
      });
    }

    console.log('Step 6/8: Seeding Payslips (2025: 12 months, 2026: 6 months)...');
    const payslips = [];
    const years = [2025, 2026];
    
    for (const y of years) {
      const maxMonth = y === 2026 ? 6 : 12;
      for (let m = 1; m <= maxMonth; m++) {
        const monthStr = `${String(m).padStart(2, '0')}/${y}`;
        
        for (let i = 0; i < createdDocs.length; i++) {
          const docId = createdDocs[i]._id;
          const baseAmt = baseSalaries[i];
          const cFac = complexFactors[i];
          
          const shifts = Math.floor(20 + Math.random() * 10);
          const avgCoeff = 1.0 + Math.random() * 0.2;
          const shiftCoeffTotal = shifts * avgCoeff;
          
          const totalEqHrs = shiftCoeffTotal * 8;
          const randomBonus = Math.floor(Math.random() * 5000000);
          const totalSal = (baseAmt / 200) * totalEqHrs * cFac + randomBonus; 
          
          payslips.push({
            doctorId: docId,
            month: monthStr,
            baseSalaryAmount: baseAmt,
            doctorCoefficient: cFac,
            totalShifts: shifts,
            hoursPerShift: 8,
            totalShiftCoefficient: parseFloat(shiftCoeffTotal.toFixed(2)),
            totalEquivalentHours: parseFloat(totalEqHrs.toFixed(2)),
            totalSalary: Math.round(totalSal),
            status: 'Đã chốt',
            createdBy: admin._id
          });
        }
      }
    }
    await Payslip.insertMany(payslips);

    console.log('Step 7/8: Seeding Daily Operation (Shifts, Appointments, Invoices)...');
    const today = new Date();
    
    await Shift.create({
      staffId: createdDocs[0]._id,
      date: today,
      startTime: '08:00',
      endTime: '12:00',
      room: 'Phòng 101',
      role: 'Bác sĩ',
      status: 'Đã xếp'
    });
    await Shift.create({
      staffId: createdDocs[1]._id,
      date: today,
      startTime: '13:00',
      endTime: '17:00',
      room: 'Phòng 102',
      role: 'Bác sĩ',
      status: 'Đã xếp'
    });

    const appts = await Appointment.insertMany([
      {
        customerId: createdCustomers[0]._id,
        doctorId: createdDocs[0]._id,
        serviceId: services[0]._id,
        date: today,
        time: '09:00',
        endTime: '09:30',
        status: 'Đã xác nhận',
        notes: 'Khám tổng quát'
      },
      {
        customerId: createdCustomers[1]._id,
        doctorId: createdDocs[1]._id,
        serviceId: services[2]._id,
        date: today,
        time: '14:00',
        endTime: '15:00',
        status: 'Chờ tiếp đón',
        notes: 'Nhổ răng khôn'
      }
    ]);

    await Invoice.insertMany([
      {
        customerId: createdCustomers[0]._id,
        appointmentId: appts[0]._id,
        amount: 400000,
        paymentMethod: 'Tiền mặt',
        paymentDate: new Date()
      },
      {
        customerId: createdCustomers[1]._id,
        appointmentId: appts[1]._id,
        amount: 1000000,
        paymentMethod: 'Chuyển khoản QR',
        paymentDate: new Date()
      }
    ]);

    console.log('Step 8/8: Finished! Master Seed execution completed.');
    process.exit(0);

  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
}

seedData();
