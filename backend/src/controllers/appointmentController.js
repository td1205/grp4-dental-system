const Appointment = require('../models/Appointment');
const Customer = require('../models/Customer');
const Service = require('../models/Service');
const Shift = require('../models/Shift');
const notificationService = require('../services/notificationService');

// Helper tính phút
const toMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
};

// Helper chuyển phút thành "HH:mm"
const toTimeString = (minutes) => {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
};

// Helper sinh ID ngẫu nhiên cho Customer nếu cần
const generateId = () => Math.random().toString(36).substr(2, 9).toUpperCase();

// Tạo lịch hẹn mới (Luồng 1)
exports.createAppointment = async (req, res) => {
    try {
        const { name, phone, date, time, serviceId, doctorId, notes } = req.body;

        if (!name || !phone || !date || !time || !serviceId || !doctorId) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin!' });
        }

        // 1. Xử lý Customer (Khởi tạo tự động nếu chưa có)
        let customer = await Customer.findOne({ phone: phone.trim() });
        if (!customer) {
            customer = new Customer({
                id: `KH_${generateId()}`,
                name: name.trim(),
                phone: phone.trim(),
                status: 'active'
            });
            await customer.save();
        } else {
            // EF2.1: Ràng buộc cảnh báo nợ hoặc lịch sử hủy lịch
            const cancelCount = await Appointment.countDocuments({ customerId: customer._id, status: 'Đã hủy' });
            if (cancelCount >= 3) {
                // Tùy theo frontend xử lý HTTP 403 cảnh báo hoặc vẫn cho qua nhưng báo alert
                // Ở đây ta có thể return lỗi yêu cầu xác minh
                if (!req.body.forceCreate) {
                    return res.status(403).json({ 
                        message: 'CẢNH BÁO EF2.1: Bệnh nhân này đã hủy lịch quá 3 lần. Vui lòng xác minh hoặc yêu cầu tạm ứng!', 
                        requiresForce: true 
                    });
                }
            }
        }

        // 2. Tính toán Slot theo Dịch vụ (BR2.4.1)
        const service = await Service.findById(serviceId);
        if (!service) return res.status(404).json({ message: 'Dịch vụ không tồn tại' });
        
        const startTimeStr = time;
        const startMins = toMinutes(startTimeStr);
        const endMins = startMins + service.duration;
        const endTimeStr = toTimeString(endMins);

        // 3. Kiểm tra quỹ thời gian ca làm việc (UC2.2)
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        const doctorShift = await Shift.findOne({
            staffId: doctorId,
            date: targetDate,
            startTime: { $lte: startTimeStr },
            endTime: { $gte: endTimeStr }
        });

        if (!doctorShift) {
            return res.status(400).json({ message: 'Bác sĩ không có ca làm việc bao phủ khoảng thời gian này!' });
        }

        // 4. Kiểm tra ca khám quá tải (EF2.2)
        // Check xem có lịch hẹn nào của bác sĩ trong ngày này bị đè giờ không
        const overlappingApt = await Appointment.findOne({
            doctorId,
            date: targetDate,
            status: { $in: ['Chờ tiếp đón', 'Chờ khám', 'Đang khám', 'Chờ xác nhận', 'Đã xác nhận', 'Đã dời'] },
            $or: [
                { time: { $lt: endTimeStr }, endTime: { $gt: startTimeStr } }
            ]
        });

        if (overlappingApt) {
            return res.status(409).json({ message: 'Khung giờ yêu cầu không còn vị trí khả dụng (đã bị chiếm dụng). Vui lòng chọn khung giờ khác!' });
        }

        // 5. Kiểm tra trùng lặp lịch cá nhân bệnh nhân (EF2.3)
        const duplicatePatientApt = await Appointment.findOne({
            customerId: customer._id,
            date: targetDate,
            status: { $in: ['Chờ tiếp đón', 'Chờ khám', 'Đang khám', 'Chờ xác nhận', 'Đã xác nhận', 'Đã dời'] },
            $or: [
                { time: { $lt: endTimeStr }, endTime: { $gt: startTimeStr } }
            ]
        });

        if (duplicatePatientApt) {
            return res.status(409).json({ message: 'Bệnh nhân này đã có lịch hẹn vào thời gian này. Vui lòng dời lịch cũ hoặc chọn thời gian khác!' });
        }

        // 6. Ghi nhận lịch hẹn
        const appointment = new Appointment({
            customerId: customer._id,
            doctorId,
            serviceId,
            date: targetDate,
            time: startTimeStr,
            endTime: endTimeStr,
            status: 'Chờ tiếp đón',
            notes: notes || ''
        });

        await appointment.save();

        // 7. Populate và gửi thông báo cho bệnh nhân
        const populatedApt = await Appointment.findById(appointment._id)
            .populate('customerId', 'name phone email')
            .populate('doctorId', 'name')
            .populate('serviceId', 'name duration');

        try {
            await notificationService.sendPatientAppointmentNotification(populatedApt.customerId, populatedApt, 'create');
        } catch (_) {}

        res.status(201).json({ message: 'Đặt lịch hẹn mới thành công!', data: populatedApt });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

// Lấy danh sách lịch hẹn
exports.getAppointments = async (req, res) => {
    try {
        let query = {};
        // BR2.5.1: Phân quyền hiển thị dữ liệu
        if (req.user && req.user.role === 'Bác sĩ') {
            query.doctorId = req.user._id;
            
            // Tự động lọc ngày hiện tại cho view Hàng đợi (có thể override qua params)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            query.date = today;
        }

        const appointments = await Appointment.find(query)
            .populate('customerId', 'name phone')
            .populate('doctorId', 'name')
            .populate('serviceId', 'name duration')
            .sort({ date: 1, time: 1 });
        
        res.status(200).json({ data: appointments });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Đổi lịch (Luồng 2)
exports.rescheduleAppointment = async (req, res) => {
    try {
        const { date, time, doctorId } = req.body;
        const appointment = await Appointment.findById(req.params.id);
        
        if (!appointment) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
        if (appointment.status === 'Đã hủy' || appointment.status === 'Không đến') {
            return res.status(400).json({ message: 'Không thể dời lịch hẹn đã hủy hoặc không đến' });
        }

        const service = await Service.findById(appointment.serviceId);
        
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        const startTimeStr = time;
        const endMins = toMinutes(startTimeStr) + service.duration;
        const endTimeStr = toTimeString(endMins);
        const newDoctorId = doctorId || appointment.doctorId;

        // Check ca làm việc
        const doctorShift = await Shift.findOne({
            staffId: newDoctorId,
            date: targetDate,
            startTime: { $lte: startTimeStr },
            endTime: { $gte: endTimeStr }
        });

        if (!doctorShift) {
            return res.status(400).json({ message: 'Bác sĩ không có ca làm việc trong khoảng thời gian này!' });
        }

        // Check xung đột (loại trừ chính nó)
        const overlappingApt = await Appointment.findOne({
            _id: { $ne: appointment._id },
            doctorId: newDoctorId,
            date: targetDate,
            status: { $in: ['Chờ tiếp đón', 'Chờ khám', 'Đang khám', 'Chờ xác nhận', 'Đã xác nhận', 'Đã dời'] },
            $or: [
                { time: { $lt: endTimeStr }, endTime: { $gt: startTimeStr } }
            ]
        });

        if (overlappingApt) {
            return res.status(409).json({ message: 'Khung giờ yêu cầu đã bị chiếm dụng!' });
        }

        // Check EF2.3 (Bệnh nhân trùng lịch)
        const duplicatePatientApt = await Appointment.findOne({
            _id: { $ne: appointment._id },
            customerId: appointment.customerId,
            date: targetDate,
            status: { $in: ['Chờ tiếp đón', 'Chờ khám', 'Đang khám', 'Chờ xác nhận', 'Đã xác nhận', 'Đã dời'] },
            $or: [
                { time: { $lt: endTimeStr }, endTime: { $gt: startTimeStr } }
            ]
        });

        if (duplicatePatientApt) {
            return res.status(409).json({ message: 'Bệnh nhân này đã có lịch hẹn vào thời gian này!' });
        }

        appointment.date = targetDate;
        appointment.time = startTimeStr;
        appointment.endTime = endTimeStr;
        appointment.doctorId = newDoctorId;
        appointment.status = 'Đã dời';

        await appointment.save();

        // Gửi thông báo dời lịch cho bệnh nhân
        try {
            const populatedForNotif = await Appointment.findById(appointment._id)
                .populate('customerId', 'name phone email')
                .populate('doctorId', 'name')
                .populate('serviceId', 'name');
            await notificationService.sendPatientAppointmentNotification(populatedForNotif.customerId, populatedForNotif, 'reschedule');
        } catch (_) {}

        res.status(200).json({ message: 'Dời lịch thành công!', data: appointment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Hủy lịch (Luồng 3)
exports.cancelAppointment = async (req, res) => {
    try {
        const { cancelReason } = req.body;
        if (!cancelReason) {
            return res.status(400).json({ message: 'Vui lòng cung cấp lý do hủy lịch!' });
        }

        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });

        appointment.status = 'Đã hủy';
        appointment.cancelReason = cancelReason;
        await appointment.save();

        // Gửi thông báo hủy lịch cho bệnh nhân
        try {
            const populatedForNotif = await Appointment.findById(appointment._id)
                .populate('customerId', 'name phone email')
                .populate('doctorId', 'name')
                .populate('serviceId', 'name');
            await notificationService.sendPatientAppointmentNotification(populatedForNotif.customerId, populatedForNotif, 'cancel');
        } catch (_) {}

        res.status(200).json({ message: 'Hủy lịch thành công!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Cập nhật trạng thái (Tiếp đón, Vào khám, v.v.) - AF2.5.1
exports.updateStatus = async (req, res) => {
    try {
        const { status, expectedOldStatus } = req.body;
        const appointmentId = req.params.id;

        const currentApt = await Appointment.findById(appointmentId);
        if (!currentApt) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });

        // BR2.5.2: Khóa lịch sử quá khứ
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(currentApt.date) < today) {
            return res.status(403).json({ message: 'Không thể thay đổi trạng thái của lịch hẹn trong quá khứ!' });
        }

        // Nếu có expectedOldStatus, dùng nó để chống xung đột (Concurrency - EF2.5.2)
        const query = { _id: appointmentId };
        if (expectedOldStatus) {
            query.status = expectedOldStatus;
        }

        const updatedApt = await Appointment.findOneAndUpdate(query, { status }, { new: true })
            .populate('customerId', 'name phone')
            .populate('doctorId', 'name')
            .populate('serviceId', 'name duration');

        if (!updatedApt) {
            return res.status(409).json({ message: 'Lịch hẹn này vừa bị thay đổi trạng thái bởi bộ phận khác. Vui lòng làm mới danh sách!' });
        }

        res.status(200).json({ message: `Cập nhật trạng thái thành ${status}`, data: updatedApt });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
