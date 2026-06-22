const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();

// Connect to Database
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/slots', require('./routes/slotRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/manager', require('./routes/managerRoutes'));

app.get('/', (req, res) => {
  res.send('Parking System API is running...');
});

const PORT = process.env.PORT || 5000;

const { releaseExpiredSlots } = require('./utils/cronJobs');

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Kickoff the automated slot flushing engine
  // CURRENTLY DISABLED BY USER REQUEST
  // const FIVE_MINUTES = 5 * 60 * 1000;
  // setInterval(() => {
  //   releaseExpiredSlots();
  // }, FIVE_MINUTES);
  
  console.log('[SYSTEM INIT] REST API Active. (Auto-Sweeper is DISABLED).');
});
