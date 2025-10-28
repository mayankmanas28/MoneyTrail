const express = require('express');
const router = express.Router();
const { createBudget, getBudgets, updateBudget, deleteBudget } = require('../controllers/budgetController.js');
const { protect } = require('../middleware/authMiddleware');


router.post('/', protect, createBudget);
router.get('/', protect, getBudgets);
router.put('/:id', protect, updateBudget);
router.delete('/:id', protect, deleteBudget);

module.exports = router;
