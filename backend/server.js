const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const axios = require('axios');
const cron = require('node-cron');
require('./cron');

const { sanitizeMiddleware } = require("./middleware/sanitizeMiddleware");

dotenv.config();
connectDB();
const app = express();

app.use(cors({
  origin: "*",
  methods: "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  credentials: true
}));

app.use(express.json());
app.use(sanitizeMiddleware());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/receipts', require('./routes/receiptRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/recurring', require('./routes/recurringTransactionRoutes'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('API Running ✅');
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`✅ Server started on port ${PORT}`));

cron.schedule("*/10 * * * *", async () => {
  const keepAliveUrl = process.env.KEEP_ALIVE_URL;
  if (!keepAliveUrl) return;
  try {
    await axios.get(keepAliveUrl);
    console.log("✅ Keep-alive ping sent!");
  } catch (error) {
    console.error("❌ Keep-alive FAILED!", error.message);
  }
});

module.exports = { app, server };
