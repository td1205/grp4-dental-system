const mongoose = require('mongoose');
const Payslip = require('../models/Payslip');
const Shift = require('../models/Shift');
const BaseSalary = require('../models/BaseSalary');
const ShiftCoefficient = require('../models/ShiftCoefficient');
const User = require('../models/User');

const getStartAndEndOfMonth = (monthStr) => {
    // monthStr: MM/yyyy
    const [month, year] = monthStr.split('/');
    const startDate = new Date(`${year}-${month}-01T00:00:00Z`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999);
    return { startDate, endDate };
};

exports.calculatePayslip = async (req, res) => {
    try {
        const { doctorId, month } = req.body;

        if (!doctorId || !month) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ Tháng/Năm và Định danh bác sĩ.' }); // VAL_002, VAL_003, VAL_004
        }

        const { startDate, endDate } = getStartAndEndOfMonth(month);

        // Check existing payslip
        let payslip = await Payslip.findOne({ doctorId, month });
        if (payslip && payslip.status === 'Đã chốt') {
            return res.status(400).json({ message: 'Phiếu lương tháng này đã được chốt, không thể tính lại.' });
        }

        // AS4.4.1: Chỉ các ca trực từ ngày 1 đến ngày cuối cùng của tháng (status: 'Đã hoàn thành')
        const shifts = await Shift.find({
            staffId: doctorId,
            date: { $gte: startDate, $lte: endDate },
            status: 'Đã hoàn thành'
        });

        // EXC_001: Còn ca trực chưa chốt công hệ số
        const unapprovedShifts = shifts.filter(s => s.coefficientStatus === 'Chưa duyệt');
        if (unapprovedShifts.length > 0) {
            return res.status(400).json({ 
                message: 'Bác sĩ còn lịch trực chưa được duyệt chốt công thực tế. Vui lòng kiểm tra lại.',
                unapprovedCount: unapprovedShifts.length
            });
        }

        // Retrieve base salary
        const baseSalary = await BaseSalary.findOne({ doctorId }).sort({ effectiveDate: -1 });
        if (!baseSalary) {
            return res.status(400).json({ message: 'Chưa có cấu hình mức tiền cơ bản cho bác sĩ này.' });
        }
        const baseSalaryAmount = baseSalary.amount;
        const doctorCoefficient = baseSalary.complexityFactor || 1;

        // Retrieve global shift coefficients
        const config = await ShiftCoefficient.findOne().sort({ createdAt: -1 });
        const matrix = config ? config.matrix : {};

        let totalEquivalentHours = 0;
        let totalShiftCoefficient = 0;
        const hoursPerShift = 8; // Standard

        shifts.forEach(shift => {
            const shiftDate = new Date(shift.date);
            const dayOfWeek = shiftDate.getUTCDay(); // 0 is Sunday, 1 is Monday...
            let dayKey = 't2_t6';
            if (dayOfWeek === 0 || dayOfWeek === 6) dayKey = 't7_cn';
            if (shift.isHoliday) dayKey = 'ngay_le'; // Giả sử có check ngày lễ sau này

            // Determine morning or afternoon
            const startHour = parseInt(shift.startTime.split(':')[0], 10);
            const shiftTimeKey = startHour < 12 ? 'ca_sang' : 'ca_chieu';

            let shiftTypeCoeff = 1;
            if (matrix && matrix[dayKey] && matrix[dayKey][shiftTimeKey]) {
                shiftTypeCoeff = matrix[dayKey][shiftTimeKey];
            }

            const patientCoeff = shift.totalPatientCoefficient || 0;
            const sumCoeff = shiftTypeCoeff + patientCoeff;
            
            totalShiftCoefficient += sumCoeff;
            totalEquivalentHours += hoursPerShift * sumCoeff;
        });

        // Calculate total salary
        let totalSalary = totalEquivalentHours * doctorCoefficient * baseSalaryAmount;

        // Rounding BR4.2.2
        totalEquivalentHours = Math.round(totalEquivalentHours * 100) / 100;
        totalSalary = Math.round(totalSalary);

        // Save to DB
        if (!payslip) {
            payslip = new Payslip({
                doctorId,
                month,
                baseSalaryAmount,
                doctorCoefficient,
                totalShifts: shifts.length,
                hoursPerShift,
                totalShiftCoefficient,
                totalEquivalentHours,
                totalSalary,
                status: 'Bản nháp',
                createdBy: req.user?.id
            });
        } else {
            payslip.baseSalaryAmount = baseSalaryAmount;
            payslip.doctorCoefficient = doctorCoefficient;
            payslip.totalShifts = shifts.length;
            payslip.hoursPerShift = hoursPerShift;
            payslip.totalShiftCoefficient = totalShiftCoefficient;
            payslip.totalEquivalentHours = totalEquivalentHours;
            payslip.totalSalary = totalSalary;
            payslip.status = 'Bản nháp';
        }

        await payslip.save();

        res.status(200).json({
            message: 'Tính lương thành công',
            data: payslip
        });

    } catch (error) {
        console.error('Error calculating payslip:', error);
        res.status(500).json({ message: 'Lỗi server khi tính lương.' });
    }
};

exports.getPayslip = async (req, res) => {
    try {
        const { doctorId, month } = req.query;
        if (!doctorId || !month) {
            return res.status(400).json({ message: 'Missing parameters.' });
        }
        
        const payslip = await Payslip.findOne({ doctorId, month }).populate('doctorId', 'name ma_nhan_vien email');
        if (!payslip) {
            return res.status(404).json({ message: 'Không tìm thấy phiếu lương.' });
        }
        res.status(200).json({ data: payslip });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server.' });
    }
};

exports.confirmPayslip = async (req, res) => {
    try {
        const { id } = req.params;
        const payslip = await Payslip.findById(id).populate('doctorId');
        if (!payslip) {
            return res.status(404).json({ message: 'Không tìm thấy phiếu lương.' });
        }
        if (payslip.status === 'Đã chốt') {
            return res.status(400).json({ message: 'Phiếu lương đã được chốt trước đó.' });
        }

        payslip.status = 'Đã chốt';
        await payslip.save();

        // Lock all shifts
        const { startDate, endDate } = getStartAndEndOfMonth(payslip.month);
        await Shift.updateMany({
            staffId: payslip.doctorId._id,
            date: { $gte: startDate, $lte: endDate },
            status: 'Đã hoàn thành'
        }, {
            $set: { coefficientStatus: 'Đã chốt lương' }
        });

        // Mock send email AF4.4.1
        console.log(`[EMAIL MOCK] Đã gửi phiếu lương ${payslip.month} tới email ${payslip.doctorId.email || 'N/A'}`);

        res.status(200).json({ message: 'Chốt phiếu lương thành công.', data: payslip });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi chốt lương.' });
    }
};

exports.getAllPayslipsForMonth = async (req, res) => {
    try {
        const { month } = req.query;
        if (!month) {
            return res.status(400).json({ message: 'Missing month parameter.' });
        }

        const payslips = await Payslip.find({ month, status: 'Đã chốt' })
            .populate('doctorId', 'ma_nhan_vien name');

        if (!payslips || payslips.length === 0) {
            return res.status(200).json({ 
                message: 'Chu kỳ được chọn chưa có dữ liệu kết toán lương',
                data: [],
                summary: { totalFund: 0, doctorCount: 0, average: 0 }
            });
        }

        let totalFund = 0;
        payslips.forEach(p => {
            totalFund += p.totalSalary;
        });

        const doctorCount = payslips.length;
        const average = Math.round(totalFund / doctorCount);

        res.status(200).json({
            data: payslips,
            summary: {
                totalFund,
                doctorCount,
                average
            }
        });
    } catch (error) {
        console.error('Error fetching payslip report:', error);
        res.status(500).json({ message: 'Lỗi server khi tải báo cáo.' });
    }
};

exports.getYearlyReport = async (req, res) => {
    try {
        let { year, doctorId } = req.query;
        if (!year) year = new Date().getFullYear().toString();

        if (req.user && req.user.role === 'Doctor') {
            doctorId = req.user.id;
        }

        const query = {
            status: 'Đã chốt',
            month: { $regex: new RegExp(year + '$') }
        };
        
        if (doctorId) {
            // Check if doctor exists
            const user = await User.findById(doctorId);
            if (!user) {
                return res.status(404).json({ message: 'Định danh bác sĩ không hợp lệ.' }); // EXC_001
            }
            if (user.trang_thai === 'Ngừng hoạt động') {
                return res.status(400).json({ message: 'Bác sĩ đã ngừng hoạt động.' }); // EXC_002
            }
            query.doctorId = doctorId;
        }

        const payslips = await Payslip.find(query).populate('doctorId', 'ma_nhan_vien name');

        const chartData = Array.from({ length: 12 }, (_, i) => ({
            month: `T${i + 1}`,
            value: 0
        }));

        const doctorMap = {};

        payslips.forEach(p => {
            // month is MM/YYYY
            const monthPart = p.month.split('/')[0];
            const monthIndex = parseInt(monthPart, 10) - 1; // 0..11

            // Add to chart
            chartData[monthIndex].value += p.totalSalary;

            // Add to table
            const dId = p.doctorId._id.toString();
            if (!doctorMap[dId]) {
                doctorMap[dId] = {
                    doctorId: dId,
                    ma_nhan_vien: p.doctorId.ma_nhan_vien,
                    name: p.doctorId.name,
                    months: Array(12).fill(null),
                    total: 0
                };
            }
            doctorMap[dId].months[monthIndex] = p.totalSalary;
            doctorMap[dId].total += p.totalSalary;
        });

        const tableData = Object.values(doctorMap);

        res.status(200).json({
            data: {
                chartData,
                tableData
            }
        });

    } catch (error) {
        console.error('Error fetching yearly report:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy báo cáo năm.' });
    }
};

exports.getFundReport = async (req, res) => {
    try {
        let { year } = req.query;
        if (!year) year = new Date().getFullYear().toString();
        
        // Admin only checking (Role is checked in frontend, but could double check here)
        if (req.user && req.user.role === 'Doctor') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const prevYear = (parseInt(year) - 1).toString();

        const currentYearPayslips = await Payslip.find({
            status: 'Đã chốt',
            month: { $regex: new RegExp(year + '$') }
        }).populate('doctorId', 'ma_nhan_vien name');

        if (!currentYearPayslips || currentYearPayslips.length === 0) {
            return res.status(200).json({ 
                message: 'Chưa có dữ liệu tài chính cho năm tra cứu', // EXC_001
                data: null
            });
        }

        const prevYearPayslips = await Payslip.find({
            status: 'Đã chốt',
            month: { $regex: new RegExp(prevYear + '$') }
        });

        let currentTotalFund = 0;
        let prevTotalFund = 0;

        const chartData = Array.from({ length: 12 }, (_, i) => ({
            month: `T${i + 1}`,
            monthVal: `${String(i + 1).padStart(2, '0')}/${year}`,
            fund: 0,
            average: 0,
            doctorCount: 0
        }));

        const doctorMap = {};

        currentYearPayslips.forEach(p => {
            currentTotalFund += p.totalSalary;
            
            const monthPart = p.month.split('/')[0];
            const monthIndex = parseInt(monthPart, 10) - 1;

            chartData[monthIndex].fund += p.totalSalary;
            chartData[monthIndex].doctorCount += 1;

            const dId = p.doctorId._id.toString();
            if (!doctorMap[dId]) {
                doctorMap[dId] = {
                    doctorId: dId,
                    ma_nhan_vien: p.doctorId.ma_nhan_vien,
                    name: p.doctorId.name,
                    totalIncome: 0
                };
            }
            doctorMap[dId].totalIncome += p.totalSalary;
        });

        // Calculate average for line chart
        chartData.forEach(c => {
            if (c.doctorCount > 0) {
                c.average = Math.round(c.fund / c.doctorCount);
            }
        });

        // Previous year total
        prevYearPayslips.forEach(p => {
            prevTotalFund += p.totalSalary;
        });

        // KPI calculations
        let maxMonth = { month: 'T-', fund: 0 };
        chartData.forEach(c => {
            if (c.fund > maxMonth.fund) maxMonth = { month: c.month, fund: c.fund };
        });

        let yoy = 0;
        if (prevTotalFund > 0) {
            yoy = ((currentTotalFund - prevTotalFund) / prevTotalFund) * 100;
        } else if (currentTotalFund > 0) {
            yoy = 100; // Infinity logically, but represent as 100% growth
        }

        // Doctor ranking
        let rankingTable = Object.values(doctorMap);
        rankingTable.sort((a, b) => b.totalIncome - a.totalIncome);
        
        // Calculate contribution %
        rankingTable = rankingTable.map(d => ({
            ...d,
            contribution: currentTotalFund > 0 ? ((d.totalIncome / currentTotalFund) * 100).toFixed(2) : 0
        }));

        res.status(200).json({
            data: {
                kpi: {
                    totalFund: currentTotalFund,
                    maxMonth: maxMonth.month,
                    maxFund: maxMonth.fund,
                    yoy: yoy.toFixed(1)
                },
                chartData,
                rankingTable
            }
        });

    } catch (error) {
        console.error('Error fetching fund report:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy báo cáo quỹ lương năm.' });
    }
};
