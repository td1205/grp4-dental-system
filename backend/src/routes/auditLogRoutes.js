const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');

// Lấy danh sách AuditLog theo user
router.get('/', async (req, res) => {
    try {
        const { performedBy } = req.query;
        let filter = {};
        // Tạm thời nếu truyền performedBy thì lọc, còn không thì lấy tất cả
        if (performedBy) {
            filter.performedBy = performedBy;
        }
        
        const logs = await AuditLog.find(filter).sort({ timestamp: -1 }).limit(50).lean();

        const User = require('../models/User');
        const mongoose = require('mongoose');

        for (let log of logs) {
            if (log.performedBy) {
                if (log.performedBy === 'AD20260601' || log.performedBy === 'ADMIN001') {
                    log.performedByName = 'Hệ thống Quản trị viên';
                } else {
                    try {
                        const conditions = [{ ma_nhan_vien: log.performedBy }];
                    if (mongoose.isValidObjectId(log.performedBy)) {
                        conditions.push({ _id: log.performedBy });
                    }
                    // Thử tìm theo name hoặc email_noi_bo nếu cần
                    conditions.push({ email_noi_bo: log.performedBy });
                    conditions.push({ name: log.performedBy });

                    const user = await User.findOne({ $or: conditions }).lean();
                    log.performedByName = user ? user.name : log.performedBy;
                } catch (err) {
                    console.error('Lỗi tìm User trong AuditLog:', err.message);
                    log.performedByName = log.performedBy;
                }
                }
            }

            // Lấy tên đối tượng
            log.documentName = log.documentId;
            try {
                if (mongoose.models[log.collectionName] && mongoose.isValidObjectId(log.documentId)) {
                    const Model = mongoose.models[log.collectionName];
                    const doc = await Model.findById(log.documentId).lean();
                    if (doc) {
                        // Tìm field nào có ý nghĩa nhất để hiển thị
                        log.documentName = doc.name || doc.title || doc.ma_nhan_vien || doc.ma_dich_vu || doc.phone || doc.email || doc.code || String(doc._id).substring(0, 8);
                    } else if (log.oldValues) {
                        // Nếu doc đã bị xóa, lấy từ oldValues
                        log.documentName = log.oldValues.name || log.oldValues.title || log.oldValues.ma_nhan_vien || `Đã xoá (${String(log.documentId).substring(0, 8)})`;
                    } else {
                        log.documentName = `Đã xoá (${String(log.documentId).substring(0, 8)})`;
                    }
                }
            } catch (err) {
                // ignore
            }
        }

        res.json({ data: logs });
    } catch (error) {
        console.error('Lỗi khi tải Audit Log:', error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
});

module.exports = router;
