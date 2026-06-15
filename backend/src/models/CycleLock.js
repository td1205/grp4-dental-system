const mongoose = require('mongoose');

const cycleLockSchema = new mongoose.Schema({
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    isLocked: { type: Boolean, default: false },
    lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    lockedAt: { type: Date }
}, { timestamps: true });

// Ensure unique month-year combination
cycleLockSchema.index({ month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('CycleLock', cycleLockSchema);
