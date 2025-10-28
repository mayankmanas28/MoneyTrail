const express = require('express');
const router = express.Router();
const { uploadReceipt } = require('../controllers/receiptController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/upload', protect, upload, uploadReceipt);

module.exports = router;