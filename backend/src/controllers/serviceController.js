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

const getSuggestedCode = async (req, res) => {
    try {
        const { category } = req.query;
        if (!category) {
            return res.status(400).json({ message: 'Vui lòng cung cấp loại dịch vụ' });
        }
        const suggestedCode = await generateServiceId(category);
        return res.status(200).json({ suggestedCode });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
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
        const { price, insurancePrice, effectiveDate } = req.body;

        const lastPrice = await ServicePriceHistory.findOne({ serviceId }).sort({ version: -1 });
        const nextVersion = lastPrice ? lastPrice.version + 1 : 1;

        const newPriceEntry = new ServicePriceHistory({
            serviceId: serviceId,
            regularPrice: price.toString(), // Phải là string
            insurancePrice: insurancePrice ? insurancePrice.toString() : '0',
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

        if (duration <= 0 || !Number.isInteger(Number(duration))) {
            return res.status(400).json({ message: 'Thời gian trung bình phải là số nguyên dương (phút)' });
        }

        const existingService = await Service.findOne({ name: name, status: 'active' });
        if (existingService) {
            return res.status(409).json({ message: 'Tên dịch vụ này đang được sử dụng. Vui lòng đặt tên khác hoặc thêm hậu tố để phân biệt' });
        }

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

const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, department, duration, description } = req.body;

        if (duration <= 0 || !Number.isInteger(Number(duration))) {
            return res.status(400).json({ message: 'Thời gian trung bình phải là số nguyên dương (phút)' });
        }

        const existingService = await Service.findOne({ name: name, status: 'active', id: { $ne: id } });
        if (existingService) {
            return res.status(409).json({ message: 'Tên dịch vụ này đang được sử dụng. Vui lòng đặt tên khác hoặc thêm hậu tố để phân biệt' });
        }

        const service = await Service.findOne({ id });
        if (!service) return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });

        service.name = name;
        service.category = category;
        service.department = department;
        service.duration = duration;
        service.description = description;

        await service.save();

        return res.status(200).json({ message: 'Cập nhật thông tin dịch vụ thành công', data: service });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service.findOne({ id });
        if (!service) return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });

        service.status = 'inactive';
        await service.save();

        return res.status(200).json({ message: 'Xóa danh mục dịch vụ thành công' });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

const restoreService = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service.findOne({ id });
        if (!service) return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });

        service.status = 'active';
        await service.save();

        return res.status(200).json({ message: 'Khôi phục danh mục dịch vụ thành công' });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

module.exports = {
    getAllServices,
    createService,
    addServicePrice,
    getSuggestedCode,
    updateService,
    deleteService,
    restoreService
};