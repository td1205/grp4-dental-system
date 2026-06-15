const ShiftCoefficient = require('../models/ShiftCoefficient');

exports.getCoefficients = async (req, res) => {
    try {
        let config = await ShiftCoefficient.findOne().sort({ createdAt: -1 });
        if (!config) {
            // Default config if none exists. If req.user is missing (e.g. some internal call), we just don't set updatedBy
            config = await ShiftCoefficient.create({ updatedBy: req.user?.id || null });
        }
        res.status(200).json({ data: config });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server khi lấy cấu hình hệ số', error: err.message });
    }
};

exports.updateCoefficients = async (req, res) => {
    try {
        const { morningWeekday, morningWeekend, morningHoliday, afternoonWeekday, afternoonWeekend, afternoonHoliday } = req.body;
        
        const values = [morningWeekday, morningWeekend, morningHoliday, afternoonWeekday, afternoonWeekend, afternoonHoliday];
        for (const val of values) {
            if (val === undefined || val === null || val === '') {
                return res.status(400).json({ message: 'Vui lòng nhập đầy đủ giá trị cho tất cả các ô' });
            }
            if (isNaN(Number(val)) || Number(val) < 1.0) {
                return res.status(400).json({ message: 'Hệ số ca làm việc phải là số dương và không được nhỏ hơn 1.0' });
            }
        }

        const newConfig = await ShiftCoefficient.create({
            morningWeekday: Number(morningWeekday), 
            morningWeekend: Number(morningWeekend), 
            morningHoliday: Number(morningHoliday),
            afternoonWeekday: Number(afternoonWeekday), 
            afternoonWeekend: Number(afternoonWeekend), 
            afternoonHoliday: Number(afternoonHoliday),
            updatedBy: req.user.id
        });

        res.status(200).json({
            message: 'Cập nhật hệ số ca làm việc thành công',
            data: newConfig
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server khi cập nhật hệ số', error: err.message });
    }
};
