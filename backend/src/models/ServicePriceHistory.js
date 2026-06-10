const mongoose = require('mongoose');

const servicePriceHistorySchema = new mongoose.Schema({
  serviceId: { type: String, required: true, ref: 'Service' },
  regularPrice: { type: String, required: true },
  insurancePrice: { type: String, default: '0' },
  effectiveDate: { type: Date, required: true },
  version: { type: Number, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('ServicePriceHistory', servicePriceHistorySchema);
