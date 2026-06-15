const Customer = require('../models/Customer');
const User = require('../models/User');

// --- 1. LẤY DANH SÁCH & TÌM KIẾM KHÁCH HÀNG (UC1.1) ---
const getAllCustomers = async (req, res) => {
    try {
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
        let sortOptions = { createdAt: -1 }; // Mặc định: Mới nhất
        const { sort } = req.query;
        if (sort === 'createdAt:asc' || sort === 'Cũ nhất') {
            sortOptions = { createdAt: 1 };
        } else if (sort === 'name:asc' || sort === 'Tên: A-Z') {
            sortOptions = { name: 1 };
        } else if (sort === 'name:desc' || sort === 'Tên: Z-A') {
            sortOptions = { name: -1 };
        }

        const pageNum = parseInt(req.query.page) || 1;
        const limitNum = parseInt(req.query.limit) || 20;
        const skip = (pageNum - 1) * limitNum;

        const customers = await Customer.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum);

        const total = await Customer.countDocuments(query);

        const mappedCustomers = customers.map(c => {
            const obj = c.toObject();
            obj._id = c._id; 
            obj.dob = obj.dateOfBirth; // Map lại cho Frontend vì UI dùng dob
            return obj;
        });

        return res.status(200).json({
            success: true,
            total: total,
            page: pageNum,
            limit: limitNum,
            data: mappedCustomers
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

        // Quét trùng lặp bên bảng Users (Nhân viên)
        const existingStaff = await User.findOne({
            $or: [{ phone: phone }, { cccd: cccd }]
        });
        if (existingStaff) {
            return res.status(400).json({
                success: false,
                message: 'Số điện thoại hoặc CCCD đã được sử dụng bởi một nhân viên hệ thống'
            });
        }

        // Quét trùng lặp bên bảng Customers
        const existingCustomer = await Customer.findOne({
            $or: [{ phone: phone }, { cccd: cccd }]
        });

        if (existingCustomer) {
            if (existingCustomer.status === 'inactive') {
                return res.status(200).json({
                    success: false,
                    needRestore: true,
                    message: 'Tài khoản này đã từng tồn tại và bị khóa. Bạn có muốn khôi phục không?',
                    data: { _id: existingCustomer._id }
                });
            }

            return res.status(400).json({
                success: false,
                message: 'Thông tin CCCD hoặc Số điện thoại đã được đăng ký trên hệ thống'
            });
        }

        // KHỞI TẠO MÃ BỆNH NHÂN (Chuẩn: KH + YYYYMM + STT hoặc BN + YYYYMM + STT)
        // Dựa vào DB cũ dùng "KH054", ở đây sinh tiếp chuẩn KH
        const date = new Date();
        const yearMonth = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        const prefix = `KH${yearMonth}`;

        const lastCustomer = await Customer.findOne({
            id: new RegExp(`^${prefix}`)
        }).sort({ createdAt: -1 });

        let stt = 1;
        if (lastCustomer && lastCustomer.id) {
            const lastSttStr = lastCustomer.id.replace(prefix, '');
            const lastStt = parseInt(lastSttStr, 10);
            if (!isNaN(lastStt)) {
                stt = lastStt + 1;
            }
        }

        const sttString = stt.toString().padStart(3, '0');
        const id = `${prefix}${sttString}`;

        const newCustomer = new Customer({
            id,
            name,
            dateOfBirth: dob,
            phone,
            cccd,
            address,
            email: email ? email : undefined,
            medicalHistory,
            status: 'active'
        });

        await newCustomer.save();

        const returnCustomer = newCustomer.toObject();
        returnCustomer._id = newCustomer._id;

        return res.status(201).json({
            success: true,
            message: 'Thêm mới khách hàng thành công',
            data: returnCustomer
        });
    } catch (error) {
        console.error("Lỗi Create Customer:", error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo hồ sơ khách hàng',
            error: error.message
        });
    }
};

// --- 3. CẬP NHẬT THÔNG TIN KHÁCH HÀNG ---
const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params; // _id
        const { name, dob, phone, address, email, status } = req.body;

        const customer = await Customer.findById(id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy KH' });
        }

        if (phone && phone !== customer.phone) {
            // Check Staff
            const existingStaffPhone = await User.findOne({ phone });
            if (existingStaffPhone) {
                return res.status(400).json({ success: false, message: 'Số điện thoại đã được đăng ký bởi nhân viên' });
            }
            // Check Customers
            const existingCustomerPhone = await Customer.findOne({ phone, _id: { $ne: id } });
            if (existingCustomerPhone) {
                return res.status(400).json({ success: false, message: 'Số điện thoại đã được đăng ký bởi khách hàng khác' });
            }
            customer.phone = phone;
        }

        if (address) customer.address = address;
        if (email !== undefined) customer.email = email === "" ? undefined : email;
        if (name) customer.name = name;
        if (dob) customer.dateOfBirth = dob;
        
        if (status) {
            customer.status = status;
        }

        await customer.save();
        return res.status(200).json({ success: true, message: 'Cập nhật thành công', data: customer });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// --- 4. XÓA KHÁCH HÀNG (SOFT DELETE) ---
const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params; // _id
        const customer = await Customer.findById(id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy KH' });
        }
        
        await Customer.updateOne({ _id: id }, { $set: { status: 'inactive' } });
        return res.status(200).json({ success: true, message: 'Đã khóa tài khoản khách hàng thành công' });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// --- 5. KHÔI PHỤC KHÁCH HÀNG ---
const restoreCustomer = async (req, res) => {
    try {
        const { id } = req.params; // _id
        const customer = await Customer.findById(id);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy KH' });
        }

        await Customer.updateOne({ _id: id }, { $set: { status: 'active' } });

        return res.status(200).json({ success: true, message: 'Khôi phục thành công' });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    getAllCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    restoreCustomer
};