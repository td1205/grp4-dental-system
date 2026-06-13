const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // Format: "HH:mm"
    endTime: { type: String, required: true },   // Format: "HH:mm"
    room: { type: String, required: true },      // Phòng khám
    role: { type: String, enum: ['Bác sĩ', 'Lễ tân'], required: true },
    // Bổ sung các trường để phục vụ đặc tả UC2.2 & UC4.4
    status: {
        type: String,
        enum: ['Đã xếp', 'Đã hủy', 'Đã hoàn thành'],
        default: 'Đã xếp'
    },
    // Lưu vết người tạo/sửa để phục vụ công tác giám sát (audit log)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Index để tăng tốc độ tìm kiếm khi kiểm tra xung đột (BR2.2.2)
shiftSchema.index({ staffId: 1, date: 1 });

module.exports = mongoose.model('Shift', shiftSchema);