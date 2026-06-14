const Invoice = require('../models/Invoice');

// GET /api/revenue
exports.getRevenueStatistics = async (req, res) => {
    try {
        const { startDate, endDate, department, revenueType, paymentMethod } = req.query;

        // EF3.4.1: Ràng buộc khối lượng dữ liệu truy vấn (tối đa 1 năm)
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            if (diffDays > 365) {
                return res.status(400).json({ 
                    message: "Chu kỳ tra cứu quá lớn. Vui lòng giới hạn khoảng thời gian tối đa trong vòng 1 năm để tránh tình trạng quá tải hệ thống." 
                });
            }
        }

        // Build Match Query
        const matchQuery = {};
        if (startDate || endDate) {
            matchQuery.paymentDate = {};
            if (startDate) matchQuery.paymentDate.$gte = new Date(startDate);
            if (endDate) matchQuery.paymentDate.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
        }
        if (department) matchQuery.department = department;
        if (revenueType) matchQuery.revenueType = revenueType;
        if (paymentMethod) matchQuery.paymentMethod = paymentMethod;

        // Bảng chi tiết hóa đơn (Luồng 1)
        const detailedInvoices = await Invoice.find(matchQuery)
            .sort({ paymentDate: -1 })
            .populate('customerId', 'name phone');

        // Thống kê gom nhóm theo tháng (Dành cho biểu đồ)
        const chartDataAggregation = await Invoice.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$paymentDate" } },
                    revenue: { $sum: "$amount" },
                    patients: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const chartData = chartDataAggregation.map(item => ({
            month: `Tháng ${item._id.split('-')[1]}`,
            fullMonth: item._id, // "2026-06"
            revenue: item.revenue,
            patients: item.patients,
            avgPerPatient: Math.round(item.revenue / item.patients)
        }));

        res.status(200).json({
            message: "Lấy thống kê doanh thu thành công",
            data: {
                invoices: detailedInvoices,
                chartData: chartData
            }
        });

    } catch (err) {
        res.status(500).json({ message: 'Lỗi server khi thống kê doanh thu', error: err.message });
    }
};
