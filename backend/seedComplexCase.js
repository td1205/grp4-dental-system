require('dotenv').config();
const mongoose = require('mongoose');

const User = require('./src/models/User');
const Customer = require('./src/models/Customer');
const Appointment = require('./src/models/Appointment');
const Shift = require('./src/models/Shift');
const MedicalRecord = require('./src/models/MedicalRecord');

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Pick any doctor
        const doctor = await User.findOne({ role: 'Bác sĩ' });
        if (!doctor) {
            console.log('No doctor found, creating one...');
            // In a real DB they have some, but let's see.
        }

        const appt = await Appointment.findOne();
        if (!appt) {
            console.log('No appointment found.');
            process.exit(0);
        }

        console.log('Found Appt:', appt._id, 'Date:', appt.date);

        // Check if shift exists for this doctor on this date
        let shift = await Shift.findOne({ staffId: appt.doctorId, date: appt.date });
        if (!shift) {
            console.log('Creating shift for this appointment');
            shift = await Shift.create({
                staffId: appt.doctorId,
                date: appt.date,
                startTime: appt.time || '08:00',
                endTime: appt.endTime || '12:00',
                room: 'P01',
                role: 'Bác sĩ',
                status: 'Đã hoàn thành'
            });
        } else {
            shift.status = 'Đã hoàn thành';
            await shift.save();
        }

        let mr = await MedicalRecord.findOne({ appointmentId: appt._id });
        if (!mr) {
            console.log('Creating Medical Record for this appointment');
            mr = await MedicalRecord.create({
                appointmentId: appt._id,
                customerId: appt.customerId,
                doctorId: appt.doctorId,
                reason: 'Khám định kỳ',
                symptoms: 'Đau răng',
                diagnosisCode: 'K01.1',
                diagnosisNote: 'Nhổ răng khôn',
                status: 'Hoàn thành'
            });
        }
        
        console.log('Data seeded successfully!');
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

seed();
