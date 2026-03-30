const express = require('express');
const router = express.Router();
const { markAttendance, getAttendanceByStudent, getAttendanceSummary, getAttendanceByDate } = require('../controllers/attendanceController');

router.post('/', markAttendance);
router.get('/student/:studentId', getAttendanceByStudent);
router.get('/summary/:studentId', getAttendanceSummary);
router.get('/date/:date', getAttendanceByDate);

module.exports = router;