const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');

module.exports = function auditPlugin(schema, options) {
  // Pre-save to get old values (only for isNew = false)
  schema.pre('save', async function () {
    if (!this.isNew) {
      const oldDoc = await this.constructor.findById(this._id).lean();
      this._oldDoc = oldDoc;
    }
  });

  // Post-save
  schema.post('save', async function (doc) {
    try {
      const action = this._oldDoc ? 'UPDATE' : 'CREATE';
      const performedBy = doc._performedBy || 'AD20260601'; // Get from doc or default
      
      await mongoose.model('AuditLog').create({
        action,
        collectionName: doc.constructor.modelName,
        documentId: doc._id,
        performedBy,
        oldValues: this._oldDoc || null,
        newValues: doc.toObject(),
      });
    } catch (err) {
      console.error('AuditLog Error (post-save):', err);
    }
  });

  // Pre-findOneAndUpdate
  schema.pre('findOneAndUpdate', async function () {
    const docToUpdate = await this.model.findOne(this.getQuery()).lean();
    this._oldDoc = docToUpdate;
  });

  // Post-findOneAndUpdate
  schema.post('findOneAndUpdate', async function (doc) {
    try {
      if (!doc) return;
      
      let action = 'UPDATE';
      // Detect soft delete
      if (doc.status === 'inactive' && this._oldDoc?.status !== 'inactive') {
        action = 'DELETE';
      }

      const performedBy = this.getOptions().performedBy || 'AD20260601';

      await mongoose.model('AuditLog').create({
        action,
        collectionName: doc.constructor.modelName,
        documentId: doc._id,
        performedBy,
        oldValues: this._oldDoc,
        newValues: doc.toObject(),
      });
    } catch (err) {
      console.error('AuditLog Error (post-findOneAndUpdate):', err);
    }
  });
};
