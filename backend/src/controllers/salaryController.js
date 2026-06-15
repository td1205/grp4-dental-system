const BaseSalary = require('../models/BaseSalary');
const User = require('../models/User');

// GET /api/salary-config
exports.getSalaryConfigs = async (req, res) => {
    try {
        // Fetch all doctors (active or not, we might want to configure salary for all)
        const doctors = await User.find({ role: 'Doctor', trang_thai: { $ne: 'Đình chỉ' } })
            .select('_id ma_nhan_vien name department specialty');

        // Fetch all base salaries sorted by date desc to easily find latest
        const allBaseSalaries = await BaseSalary.find()
            .sort({ effectiveDate: -1, createdAt: -1 })
            .populate('doctorId', 'ma_nhan_vien name')
            .populate('createdBy', 'name');

        const today = new Date();
        today.setHours(0,0,0,0);

        // Build current active configs map
        const activeConfigsMap = {};

        allBaseSalaries.forEach(config => {
            const docId = config.doctorId?._id?.toString() || config.doctorId?.toString();
            if (!docId) return;
            const cDate = new Date(config.effectiveDate);
            cDate.setHours(0,0,0,0);
            
            // if we haven't found an active one for this doctor yet, and this config's date <= today
            if (!activeConfigsMap[docId] && cDate <= today) {
                activeConfigsMap[docId] = config;
            }
        });

        // Map doctors to their current active config (or defaults)
        const doctorConfigs = doctors.map(doc => {
            const active = activeConfigsMap[doc._id.toString()];
            return {
                doctorId: doc._id,
                maBS: doc.ma_nhan_vien,
                name: doc.name,
                specialty: doc.specialty || doc.department || 'Chung',
                amount: active ? active.amount : 0,
                complexityFactor: active ? active.complexityFactor : 1.0,
                effectiveDate: active ? active.effectiveDate : null
            };
        });

        res.status(200).json({
            message: 'Lấy lịch sử cấu hình lương thành công',
            data: {
                doctors: doctorConfigs,
                history: allBaseSalaries
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server khi lấy cấu hình lương', error: err.message });
    }
};

// POST /api/salary-config
exports.createSalaryConfig = async (req, res) => {
    try {
        const { configs, effectiveDate } = req.body;
        // configs is an array: [{ doctorId, amount, complexityFactor }]

        if (!effectiveDate || !configs || !Array.isArray(configs) || configs.length === 0) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
        }

        const date = new Date(effectiveDate);
        date.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (date < today) {
            return res.status(400).json({ message: 'Số tiền hoặc ngày áp dụng không hợp lệ' });
        }

        const newRecords = [];
        for (const conf of configs) {
            const numAmount = Number(String(conf.amount).replace(/,/g, ''));
            const numFactor = Number(conf.complexityFactor);

            if (isNaN(numAmount) || numAmount <= 0 || isNaN(numFactor) || numFactor <= 0) {
                return res.status(400).json({ message: 'Số tiền hoặc ngày áp dụng không hợp lệ' });
            }

            newRecords.push({
                doctorId: conf.doctorId,
                amount: numAmount,
                complexityFactor: numFactor,
                effectiveDate: date,
                createdBy: req.user.id
            });
        }

        // Insert all
        await BaseSalary.insertMany(newRecords);

        res.status(201).json({
            message: 'Thiết lập mức tiền cơ bản thành công',
            data: newRecords
        });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server khi tạo cấu hình lương', error: err.message });
    }
};
