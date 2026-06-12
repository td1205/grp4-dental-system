const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Đảm bảo bạn có Model User

// Middleware kiểm tra đăng nhập
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return res.status(401).json({ message: "Chưa đăng nhập" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
    } catch (err) {
        res.status(401).json({ message: "Token không hợp lệ" });
    }
};

// Middleware kiểm tra quyền (Phân quyền Admin/Bác sĩ/Lễ tân)
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Bạn không có quyền thực hiện chức năng này" });
        }
        next();
    };
};

module.exports = { protect, restrictTo };