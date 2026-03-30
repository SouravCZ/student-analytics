const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: String, required: true },
  examType: { type: String, enum: ['Assignment', 'MidTerm', 'Final', 'Quiz'], required: true },
  marksObtained: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  semester: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  remarks: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Marks', marksSchema);