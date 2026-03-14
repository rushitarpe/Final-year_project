const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mentee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    description: {
        type: String,
        required: [true, 'Please provide description of assignment']
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'submitted', 'graded'],
        default: 'pending'
    },
    submissionDetails: {
        type: String
    },
    submissionDate: {
        type: Date
    },
    score: {
        type: Number,
        min: 0,
        max: 100
    },
    grade: {
        type: String,
        enum: ['A', 'B', 'C', 'D', 'F', 'Uncategorized'],
    },
    feedback: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
