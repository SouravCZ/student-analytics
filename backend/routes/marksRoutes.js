const express = require('express');
const router = express.Router();
const { addMarks, getMarksByStudent, getPerformanceSummary } = require('../controllers/marksController');

router.post('/', addMarks);
router.get('/student/:studentId', getMarksByStudent);
router.get('/summary/:studentId', getPerformanceSummary);

module.exports = router;