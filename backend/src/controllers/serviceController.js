const Service = require('../models/Service');


const getAllServices = async (req, res) => {
    try {

        const services = await Service.find().sort({ createdAt: -1 });

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


const createService = async (req, res) => {
    try {
        const newService = new Service(req.body);
        await newService.save();

        return res.status(201).json({
            message: 'Thêm dịch vụ thành công',
            data: newService
        });
    } catch (error) {
        return res.status(400).json({ message: 'Lỗi khi tạo dịch vụ', error: error.message });
    }
};

module.exports = {
    getAllServices,
    createService
};