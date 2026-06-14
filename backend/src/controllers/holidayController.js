const Holiday = require('../models/Holiday');
const Appointment = require('../models/Appointment');

// 1. Lấy danh sách tất cả lịch nghỉ lễ
const getAllHolidays = async (req, res) => {
    try {
        const holidays = await Holiday.find().sort({ startDate: 1 });
        res.status(200).json({ success: true, data: holidays });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi hệ thống', error: err.message });
    }
};

// 2. Tạo lịch nghỉ lễ mới
const createHoliday = async (req, res) => {
    try {
        const { name, startDate, endDate, type, department, description } = req.body;

        // EF2.1.3: Ngày bắt đầu không được là quá khứ
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (start < today) {
            return res.status(400).json({ message: 'Ngày bắt đầu lịch nghỉ không được nằm trong quá khứ.' });
        }

        // EF2.1.2: Ngày kết thúc phải sau ngày bắt đầu
        const end = new Date(endDate);
        if (end < start) {
            return res.status(400).json({ message: 'Thời gian kết thúc phải sau thời gian bắt đầu.' });
        }

        // EF2.1.4: Kiểm tra trùng lặp/liên tiếp với lịch nghỉ đã có
        const overlap = await Holiday.findOne({
            $or: [
                { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
            ]
        });
        if (overlap) {
            return res.status(409).json({
                message: 'Khoảng thời gian này liên tiếp/trùng lặp với một lịch nghỉ sẵn có trong hệ thống. Bạn có muốn gộp thành một chu kỳ nghỉ liên tiếp không?',
                conflictWith: overlap
            });
        }

        const holiday = new Holiday({ name, startDate, endDate, type, department, description });
        await holiday.save();

        // EF2.1.1 & BR2.1.2: Kiểm tra lịch khám trùng ngày
        const conflictingAppointments = await Appointment.find({
            date: { $gte: new Date(startDate), $lte: new Date(endDate) },
            status: { $in: ['pending', 'confirmed'] }
        });

        if (conflictingAppointments.length > 0) {
            // Tự động chuyển trạng thái sang "Chờ điều phối"
            await Appointment.updateMany(
                { _id: { $in: conflictingAppointments.map(a => a._id) } },
                { $set: { status: 'pending', notes: 'Tự động chuyển - Ngày nghỉ lễ được thiết lập' } }
            );
            return res.status(201).json({
                success: true,
                message: 'Thiết lập thành công. Có ' + conflictingAppointments.length + ' lịch khám bị ảnh hưởng đã được chuyển sang Chờ điều phối.',
                data: holiday,
                affectedAppointments: conflictingAppointments.length,
                hasConflict: true
            });
        }

        res.status(201).json({ success: true, message: 'Thiết lập thành công', data: holiday });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi hệ thống', error: err.message });
    }
};

// 3. Cập nhật lịch nghỉ lễ
const updateHoliday = async (req, res) => {
    try {
        const { name, startDate, endDate, type, department, description } = req.body;

        // EF2.1.2: Validate khoảng ngày
        if (new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({ message: 'Thời gian kết thúc phải sau thời gian bắt đầu.' });
        }

        const holiday = await Holiday.findByIdAndUpdate(
            req.params.id,
            { name, startDate, endDate, type, department, description },
            { new: true }
        );

        if (!holiday) return res.status(404).json({ message: 'Không tìm thấy lịch nghỉ' });

        res.status(200).json({ success: true, message: 'Chỉnh sửa thành công', data: holiday });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi hệ thống', error: err.message });
    }
};

// 4. Xóa lịch nghỉ lễ
const deleteHoliday = async (req, res) => {
    try {
        const holiday = await Holiday.findByIdAndDelete(req.params.id);
        if (!holiday) return res.status(404).json({ message: 'Không tìm thấy lịch nghỉ' });
        res.status(200).json({ success: true, message: 'Xóa ngày nghỉ thành công' });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi hệ thống', error: err.message });
    }
};

module.exports = { getAllHolidays, createHoliday, updateHoliday, deleteHoliday };
