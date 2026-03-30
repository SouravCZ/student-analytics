const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config({ path: __dirname + '/.env' });

const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const marksRoutes = require('./routes/marksRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/marks', marksRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Student Analytics Backend is running!' });
});

mongoose.connect('mongodb://localhost:27017/student-analytics')
  .then(() => {
    console.log('MongoDB Connected!');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.log('DB Error:', err));