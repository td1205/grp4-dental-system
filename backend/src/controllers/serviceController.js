const Service = require('../models/Service');
const ServicePriceHistory = require('../models/ServicePriceHistory');

// --- 1. HÀM TỰ ĐỘNG SINH MÃ DỊCH VỤ (Chuẩn logic giống Nhân viên) ---
const generateServiceId = async (category) => {
    // 1. Phân loại tiền tố
    let prefix = 'DV';
    if (category === 'Khám bệnh') prefix = 'KB';
    else if (category === 'Xét nghiệm') prefix = 'XN';
    else if (category === 'CĐHA') prefix = 'HA';
    else if (category === 'Phẫu thuật') prefix = 'PT';

    // 2. Tìm dịch vụ mới nhất có cùng tiền tố
    const lastService = await Service.findOne({ id: new RegExp('^' + prefix) })
        .sort({ id: -1 });

    // 3. Rút số thứ tự lớn nhất và cộng 1
    let stt = 1;
    if (lastService && lastService.id) {
        const lastSttStr = lastService.id.replace(prefix, '');
        const lastSttNum = parseInt(lastSttStr, 10);
        if (!isNaN(lastSttNum)) {
            stt = lastSttNum + 1;
        }
    }

    // 4. Trả về mã hoàn chỉnh (VD: KB001, XN005)
    return prefix + stt.toString().padStart(3, '0');
};
const getAllServices = async (req, res) => {
    try {
        // Thêm .populate để lấy dữ liệu chi tiết từ bảng ServicePriceHistory
        const services = await Service.find()
            .populate('priceHistory')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'Lấy danh sách dịch vụ thành công',
            total: services.length,
            data: services
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách dịch vụ:", error);
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};
const addServicePrice = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { price, effectiveDate } = req.body;

        const lastPrice = await ServicePriceHistory.findOne({ serviceId }).sort({ version: -1 });
        const nextVersion = lastPrice ? lastPrice.version + 1 : 1;

        const newPriceEntry = new ServicePriceHistory({
            serviceId: serviceId,
            regularPrice: price.toString(), // Phải là string
            insurancePrice: '0',           // Bắt buộc vì Schema yêu cầu
            effectiveDate: new Date(effectiveDate), // Phải ép kiểu sang Date object
            version: nextVersion
        });

        await newPriceEntry.save();
        await Service.updateOne({ id: serviceId }, { $push: { priceHistory: newPriceEntry._id } });

        return res.status(201).json({ message: 'Thành công', data: newPriceEntry });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
// --- 3. API THÊM MỚI DỊCH VỤ ---
const createService = async (req, res) => {
    try {
        const { name, category, department, duration, description } = req.body;

        // Gọi hàm tự động sinh mã
        const newId = await generateServiceId(category);

        const newService = new Service({
            id: newId,
            name,
            category,
            department,
            duration,
            description
        });

        await newService.save();

        return res.status(201).json({
            message: 'Thêm mới dịch vụ thành công',
            data: newService
        });
    } catch (error) {
        console.error("Lỗi khi thêm dịch vụ:", error);
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};
module.exports = {
    getAllServices,
    createService,
    addServicePrice
};