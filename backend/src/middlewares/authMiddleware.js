const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware xác thực người dùng (Login Required)
const protect = async (req, res, next) => {
    try {
        let token;
        // Lấy token từ header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: "Bạn chưa đăng nhập, vui lòng cung cấp token!" });
        }

        // Giải mã token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Kiểm tra xem User có còn tồn tại trong DB không
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({ message: "Người dùng không còn tồn tại trong hệ thống." });
        }

        // Gán user vào req để các bước sau sử dụng
        req.user = currentUser;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
    }
};

// Middleware phân quyền (Role-based Access Control)
const restrictTo = (...roles) => {
    return (req, res, next) => {
        // Kiểm tra vai trò của người dùng (gán từ middleware protect)
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Bạn không có quyền truy cập vào chức năng này."
            });
        }
        next();
    };
};

module.exports = { protect, restrictTo };