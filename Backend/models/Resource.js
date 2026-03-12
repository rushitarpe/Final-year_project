const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    url: {
        type: String,
        required: true, // URL to cloudinary or external link
    },
    type: {
        type: String,
        enum: ['pdf', 'video', 'link', 'document', 'other'],
        default: 'other',
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Resource', resourceSchema);
