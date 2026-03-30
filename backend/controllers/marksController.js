const Marks = require('../models/marks');

// Add marks
exports.addMarks = async (req, res) => {
  try {
    const marks = new Marks(req.body);
    await marks.save();
    res.status(201).json({ success: true, data: marks });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get marks by student
exports.getMarksByStudent = async (req, res) => {
  try {
    const marks = await Marks.find({ studentId: req.params.studentId })
      .sort({ date: -1 });
    res.json({ success: true, data: marks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get performance summary for a student
exports.getPerformanceSummary = async (req, res) => {
  try {
    const marks = await Marks.find({ studentId: req.params.studentId });
    const subjects = {};
    marks.forEach(m => {
      if (!subjects[m.subject]) subjects[m.subject] = { total: 0, obtained: 0 };
      subjects[m.subject].total += m.totalMarks;
      subjects[m.subject].obtained += m.marksObtained;
    });
    const summary = Object.keys(subjects).map(sub => ({
      subject: sub,
      percentage: ((subjects[sub].obtained / subjects[sub].total) * 100).toFixed(2)
    }));
    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};