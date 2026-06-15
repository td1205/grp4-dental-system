const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const Medicine = require('../models/Medicine');

exports.getByCustomer = async (req, res) => {
    try {
        const { customerId } = req.params;
        const records = await MedicalRecord.find({ customerId })
            .populate('doctorId', 'name')
            .populate('appointmentId', 'date time serviceId')
            .sort({ createdAt: -1 });

        // Lấy đơn thuốc cho từng bệnh án
        const result = await Promise.all(records.map(async (r) => {
            const prescription = await Prescription.findOne({ medicalRecordId: r._id })
                .populate('items.medicineId', 'name unit');
            return { ...r.toObject(), prescription };
        }));

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi lấy lịch sử y khoa', error: error.message });
    }
};




exports.finishExam = async (req, res) => {
    try {
        const { appointmentId, customerId, doctorId, clinicalData, prescriptionItems } = req.body;

        // Validation EF3.2.2: Bắt buộc phải nhập chẩn đoán
        if (!clinicalData || !clinicalData.diagnosisCode || !clinicalData.diagnosisCode.trim()) {
            return res.status(400).json({ success: false, message: 'Bắt buộc phải nhập ít nhất một mã chẩn đoán chính!' });
        }

        // Tạo Medical Record
        const record = new MedicalRecord({
            appointmentId,
            customerId,
            doctorId,
            reason: clinicalData.reason || '',
            symptoms: clinicalData.symptoms || '',
            medicalHistory: clinicalData.medicalHistory || '',
            diagnosisCode: clinicalData.diagnosisCode,
            diagnosisNote: clinicalData.diagnosisNote || '',
            status: 'Hoàn thành'
        });

        await record.save();

        // Xử lý đơn thuốc nếu có (Kê đơn)
        if (prescriptionItems && prescriptionItems.length > 0) {
            const pres = new Prescription({
                medicalRecordId: record._id,
                items: prescriptionItems.map(item => ({
                    medicineId: item.medicineId,
                    quantity: item.quantity,
                    dosage: item.dosage,
                    usage: item.usage
                }))
            });
            await pres.save();

            // Tùy chọn: Trừ tồn kho thuốc
            for (const item of prescriptionItems) {
                await Medicine.findByIdAndUpdate(item.medicineId, {
                    $inc: { stock: -item.quantity }
                });
            }
        }

        // Chuyển trạng thái lịch hẹn sang "Hoàn thành"
        // (Trong tương lai có thể là "Chờ thanh toán thuốc" nếu kết nối Invoice)
        await Appointment.findByIdAndUpdate(appointmentId, {
            status: 'Hoàn thành'
        });

        res.status(200).json({ 
            success: true, 
            message: 'Đã hoàn thành ca khám và cập nhật hồ sơ!',
            data: record 
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi hoàn thành ca khám', error: error.message });
    }
};
