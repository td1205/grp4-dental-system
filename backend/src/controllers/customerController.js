const Customer = require('../models/Customer');

// --- 1. LẤY DANH SÁCH & TÌM KIẾM KHÁCH HÀNG (UC1.1) ---
const getAllCustomers = async (req, res) => {
    try {
        // Đổi từ 'keyword' thành 'search' để khớp 100% với Frontend
        const { search } = req.query;
        let query = {};

        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } },
                    { cccd: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const customers = await Customer.find(query).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: customers.length,
            data: customers
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách khách hàng',
            error: error.message
        });
    }
};


// --- 2. THÊM MỚI KHÁCH HÀNG (Sinh mã tự động theo chuẩn) ---
const createCustomer = async (req, res) => {
    try {
        const { name, dob, phone, cccd, address, email, medicalHistory } = req.body;

        if (!name || !dob || !phone || !cccd || !address) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập đầy đủ: Họ tên, Ngày sinh, Số điện thoại, CCCD và Địa chỉ'
            });
        }

        const existingCustomer = await Customer.findOne({
            $or: [{ phone: phone }, { cccd: cccd }]
        });

        if (existingCustomer) {
            return res.status(400).json({
                success: false,
                message: 'Thông tin CCCD hoặc Số điện thoại đã được đăng ký trên hệ thống'
            });
        }

        // KHỞI TẠO MÃ BỆNH NHÂN (Chuẩn: BN + YYYYMM + STT)
        const date = new Date();
        const yearMonth = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        const prefix = `BN${yearMonth}`;

        const lastCustomer = await Customer.findOne({
            ma_nhan_vien: new RegExp(`^${prefix}`)
        }).sort({ createdAt: -1 });

        let stt = 1;
        if (lastCustomer && lastCustomer.ma_nhan_vien) {
            const lastSttStr = lastCustomer.ma_nhan_vien.replace(prefix, '');
            const lastStt = parseInt(lastSttStr, 10);
            if (!isNaN(lastStt)) {
                stt = lastStt + 1;
            }
        }

        const sttString = stt.toString().padStart(2, '0');
        const ma_nhan_vien = `${prefix}${sttString}`;

        const newCustomer = new Customer({
            ma_nhan_vien,
            name,
            birthday: dob,
            phone,
            cccd,
            address,
            // ✨ Bí kíp xử lý lỗi trùng Email: Nếu email rỗng ("") thì gán thành undefined
            email: email ? email : undefined,
            medicalHistory,
            trang_thai: 'Đang hoạt động'
        });

        await newCustomer.save();

        return res.status(201).json({
            success: true,
            message: 'Thêm mới khách hàng thành công',
            data: newCustomer
        });
    } catch (error) {
        // In log ra Console để dễ kiểm tra nếu còn lỗi
        console.error("Lỗi Create Customer:", error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo hồ sơ khách hàng',
            error: error.message
        });
    }
};

module.exports = {
    getAllCustomers,
    createCustomer
};