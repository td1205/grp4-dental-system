const mongoose = require('mongoose');
const auditPlugin = require('../utils/auditPlugin');

const serviceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  duration: { type: Number, required: true }, // Thời gian điều trị (phút)
  description: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, {
  timestamps: true
});

// Kích hoạt AuditLog plugin cho bảng Service
serviceSchema.plugin(auditPlugin);

module.exports = mongoose.model('Service', serviceSchema);
