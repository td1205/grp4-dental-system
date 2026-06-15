const Medicine = require('../models/Medicine');

exports.getAllMedicines = async (req, res) => {
    try {
        // BR3.2.1: Chỉ hiển thị thuốc hoạt động và tồn > 0
        const medicines = await Medicine.find({ status: 'active', stock: { $gt: 0 } });
        res.status(200).json({ success: true, data: medicines });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh mục thuốc', error: error.message });
    }
};

exports.seedMedicines = async (req, res) => {
    try {
        const count = await Medicine.countDocuments();
        if (count > 0) {
            return res.status(200).json({ success: true, message: 'Thuốc đã được seed trước đó.' });
        }

        const mockMedicines = [
            { code: 'M001', name: 'Paracetamol 500mg', unit: 'Viên', price: 2000, stock: 1000, usageGuide: 'Uống sau ăn, mỗi lần 1 viên' },
            { code: 'M002', name: 'Amoxicillin 500mg', unit: 'Viên', price: 5000, stock: 500, usageGuide: 'Kháng sinh, mỗi lần 1 viên, ngày 2 lần' },
            { code: 'M003', name: 'Nước súc miệng Kin B5', unit: 'Chai', price: 150000, stock: 50, usageGuide: 'Súc miệng sau khi đánh răng 15ml' },
            { code: 'M004', name: 'Ibuprofen 400mg', unit: 'Viên', price: 3000, stock: 0, usageGuide: 'Giảm đau, ngày 2 lần' }, // Hết hàng
            { code: 'M005', name: 'Kem bôi mỡ Metrogyl Denta', unit: 'Tuýp', price: 45000, stock: 100, usageGuide: 'Bôi trực tiếp lên vết loét' }
        ];

        await Medicine.insertMany(mockMedicines);
        res.status(201).json({ success: true, message: 'Seed dữ liệu thuốc thành công!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi seed thuốc', error: error.message });
    }
};
