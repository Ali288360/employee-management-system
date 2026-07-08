const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

// Load environment variables immediately before other imports
dotenv.config();

const connectDB = require('./config/db');
const { serve } = require('inngest/express');
const { inngest } = require('./inngest/client');
const { functions } = require('./inngest/functions');

// Connect to database
connectDB();

const app = express();

// CORS configuration - Allow client port 5173 with credentials
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie Parser Middleware
app.use(cookieParser());

// Inngest route serve handler
app.use('/api/inngest', serve({ client: inngest, functions }));

// Route Mounts
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/leaves', require('./routes/leaves'));
app.use('/api/payslips', require('./routes/payslips'));

// Base Route
app.get('/api', (req, res) => {
  res.json({ message: 'EMS Backend API Running successfully.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'An internal server error occurred',
  });
});

// Start Server locally if not running on Vercel serverless environment
if (require.main === module || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;
