const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  rollNumber: { type: String, required: true },
  department: { type: String, required: true },
  semester: { type: Number, required: true },
  section: { type: String },
  phone: { type: String },
  parentPhone: { type: String },
  address: { type: String },
  joiningYear: { type: Number },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);