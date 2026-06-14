const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  duration: { type: String, enum: ['Cả ngày', 'Sáng', 'Chiều'], default: 'Cả ngày' },
  leaveType: { type: String, enum: ['Phép năm', 'Việc riêng', 'Nghỉ bệnh', 'Nghỉ lễ'], required: true },
  reason: { type: String, required: true },
  status: { type: String, default: 'Chờ duyệt', enum: ['Chờ duyệt', 'Đã duyệt', 'Từ chối', 'Đã hủy', 'Chờ hủy phép'] },
  rejectionReason: { type: String, default: '' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

leaveRequestSchema.index({ staffId: 1, startDate: 1 });

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);