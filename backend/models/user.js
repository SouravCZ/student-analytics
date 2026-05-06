const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Student'], required: true },
  department: { type: String, default: '' },
  linkedStudentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);