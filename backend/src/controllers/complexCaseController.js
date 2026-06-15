const Shift = require('../models/Shift');
const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');

exports.getComplexCaseShifts = async (req, res) => {
    try {
        const { doctorName, specialty, status } = req.query;

        // Xây dựng query cho Shift
        let shiftQuery = { role: 'Bác sĩ', status: 'Đã hoàn thành' };
        if (status) {
            shiftQuery.coefficientStatus = status;
        }

        let shifts = await Shift.find(shiftQuery)
            .populate({
                path: 'staffId',
                match: (doctorName || specialty) ? {
                    ...(doctorName && { name: { $regex: doctorName, $options: 'i' } }),
                    ...(specialty && { specialty: { $regex: specialty, $options: 'i' } })
                } : {}
            })
            .sort({ date: -1 });

        // Lọc bỏ những shift không có staffId (do match populate trả về null)
        shifts = shifts.filter(s => s.staffId !== null);

        // Chạy qua từng shift để tìm các MedicalRecord tương ứng
        const result = [];
        for (const shift of shifts) {
            // Tìm Appointment trong ngày đó của bác sĩ
            const startOfDay = new Date(shift.date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(shift.date);
            endOfDay.setHours(23, 59, 59, 999);

            const appointments = await Appointment.find({
                doctorId: shift.staffId._id,
                date: { $gte: startOfDay, $lte: endOfDay }
            });

            const apptIds = appointments.map(a => a._id);

            // Tìm MedicalRecord thuộc các appointment này
            const records = await MedicalRecord.find({
                appointmentId: { $in: apptIds }
            }).populate('customerId', 'name');

            if (records.length > 0) {
                // Tự động gán đề xuất (AF4.3.1)
                const mappedRecords = records.map(r => {
                    let suggested = 0;
                    // Phẫu thuật rạch nướu, nhổ răng khôn...
                    const code = r.diagnosisCode ? r.diagnosisCode.toLowerCase() : '';
                    if (code.includes('k01') || code.includes('phẫu thuật') || code.includes('nhổ răng khôn') || code.includes('nhorang8') || code.includes('tủy')) {
                        suggested = 0.3;
                    }
                    return {
                        recordId: r._id,
                        customerName: r.customerId ? r.customerId.name : 'Unknown',
                        diagnosisCode: r.diagnosisCode,
                        diagnosisNote: r.diagnosisNote,
                        patientCoefficient: r.patientCoefficient || 0,
                        coefficientNote: r.coefficientNote || '',
                        suggestedCoefficient: suggested
                    };
                });

                result.push({
                    _id: shift._id,
                    doctorName: shift.staffId.name,
                    maBS: shift.staffId.ma_nhan_vien,
                    specialty: shift.staffId.specialty || 'Nha khoa',
                    date: shift.date,
                    startTime: shift.startTime,
                    endTime: shift.endTime,
                    totalPatientCoefficient: shift.totalPatientCoefficient,
                    coefficientStatus: shift.coefficientStatus,
                    medicalRecords: mappedRecords
                });
            }
        }

        res.status(200).json({ data: result });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};

exports.updateComplexCaseCoefficient = async (req, res) => {
    try {
        const { shiftId } = req.params;
        const { medicalRecords } = req.body; // array of { recordId, patientCoefficient, coefficientNote }

        const shift = await Shift.findById(shiftId);
        if (!shift) return res.status(404).json({ message: 'Không tìm thấy ca trực' });

        if (shift.coefficientStatus === 'Đã chốt lương') {
            return res.status(400).json({ message: 'Ca trực đã chốt lương, không thể chỉnh sửa hệ số' });
        }

        let total = 0;
        for (const item of medicalRecords) {
            const coeff = Number(item.patientCoefficient);
            if (coeff !== 0 && (coeff < 0.1 || coeff > 0.5)) {
                return res.status(400).json({ message: `Hệ số vi phạm biên độ cho phép (0.1 - 0.5). Vui lòng kiểm tra lại!` });
            }

            // Update MR
            await MedicalRecord.findByIdAndUpdate(item.recordId, {
                patientCoefficient: coeff,
                coefficientNote: item.coefficientNote || ''
            });

            total += coeff;
        }

        // Float math fix
        total = Math.round(total * 100) / 100;

        shift.totalPatientCoefficient = total;
        shift.coefficientStatus = 'Đã duyệt';
        await shift.save();

        res.status(200).json({ message: 'Xác nhận phê duyệt hệ số thành công', data: shift });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};
