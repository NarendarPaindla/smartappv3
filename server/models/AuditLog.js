const mongoose = require('mongoose');

const auditLogSchema = mongoose.Schema(
    {
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        action: {
            type: String,
            required: true,
        },
        targetUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        details: {
            type: String,
        },
        ip: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
