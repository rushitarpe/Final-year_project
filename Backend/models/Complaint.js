const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    mentee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mentee',
        required: true
    },
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mentor',
        required: true
    },
    subject: {
        type: String,
        required: [true, 'Please add a subject']
    },
    description: {
        type: String,
        required: [true, 'Please provide a description of the complaint']
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Complaint', complaintSchema);
