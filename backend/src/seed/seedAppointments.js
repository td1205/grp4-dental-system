const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Customer = require('../models/Customer');
const Service = require('../models/Service');
const User = require('../models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB');
    
    // Find some doctors
    const doctors = await User.find({ role: 'Doctor' });
    if (doctors.length === 0) {
        console.error('Không tìm thấy bác sĩ nào trong hệ thống!');
        process.exit(1);
    }

    // Find some services
    const services = await Service.find({ status: 'active' });
    if (services.length === 0) {
        console.error('Không tìm thấy dịch vụ nào!');
        process.exit(1);
    }

    // Create some customers if not enough
    let customers = await Customer.find();
    if (customers.length < 3) {
        await Customer.create([
            { id: 'KH_T1', name: 'Nguyễn Văn Test 1', phone: '0988000111', cccd: '012345678901', status: 'active' },
            { id: 'KH_T2', name: 'Trần Thị Test 2', phone: '0988000222', cccd: '012345678902', status: 'active' },
            { id: 'KH_T3', name: 'Lê Văn Test 3', phone: '0988000333', cccd: '012345678903', status: 'active' }
        ]);
        customers = await Customer.find();
    }

    // Create appointments for TODAY
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const timeSlots = ['08:00', '09:00', '10:00', '14:00', '15:00'];
    const appointmentsToInsert = [];

    // Tạo 5 lịch hẹn ngẫu nhiên
    for (let i = 0; i < 5; i++) {
        const doc = doctors[i % doctors.length];
        const srv = services[i % services.length];
        const cus = customers[i % customers.length];
        const time = timeSlots[i % timeSlots.length];
        
        // Tính endTime giả định
        const [h, m] = time.split(':').map(Number);
        const endMins = h * 60 + m + srv.duration;
        const endH = Math.floor(endMins / 60).toString().padStart(2, '0');
        const endM = (endMins % 60).toString().padStart(2, '0');
        const endTime = `${endH}:${endM}`;

        appointmentsToInsert.push({
            id: `APT_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            customerId: cus._id,
            doctorId: doc._id,
            serviceId: srv._id,
            date: today,
            time: time,
            endTime: endTime,
            status: 'Chờ tiếp đón',
            notes: 'Lịch được sinh tự động'
        });
    }

    // Xóa các lịch hẹn rác sinh tự động trước đó nếu có (tuỳ chọn)
    await Appointment.deleteMany({ notes: 'Lịch được sinh tự động', date: today });
    
    try {
        await Appointment.collection.dropIndex('id_1');
        console.log('Dropped legacy index id_1');
    } catch(e) {}

    await Appointment.insertMany(appointmentsToInsert);
    
    console.log(`✅ Đã tạo thành công ${appointmentsToInsert.length} lịch hẹn cho ngày hôm nay (${today.toLocaleDateString()}) với trạng thái "Chờ tiếp đón".`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
