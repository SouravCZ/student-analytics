const Attendance = require('../models/attendance');

// Mark attendance
exports.markAttendance = async (req, res) => {
  try {
    const attendance = new Attendance(req.body);
    await attendance.save();
    res.status(201).json({ success: true, data: attendance });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get attendance by student
exports.getAttendanceByStudent = async (req, res) => {
  try {
    const records = await Attendance.find({ studentId: req.params.studentId })
      .sort({ date: -1 });
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get attendance summary (percentage) for a student
exports.getAttendanceSummary = async (req, res) => {
  try {
    const records = await Attendance.find({ studentId: req.params.studentId });
    const total = records.length;
    const present = records.filter(r => r.status === 'Present').length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;
    res.json({ success: true, data: { total, present, percentage } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get attendance by date
exports.getAttendanceByDate = async (req, res) => {
  try {
    const records = await Attendance.find({ date: req.params.date })
      .populate('studentId', 'name rollNumber');
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};