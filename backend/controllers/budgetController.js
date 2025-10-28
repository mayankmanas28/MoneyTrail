const mongoose = require("mongoose");
const Budget = require('../models/Budget.js');
const IncomeExpense = require('../models/IncomeExpense.js');

const createBudget = async (req, res) => {
    try {
        const { category, amount, month, year } = req.body;
        const budget = new Budget({ user: req.user.id, category, amount, month, year });
        const savedBudget = await budget.save();
        res.status(201).json(savedBudget);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

const getBudgets = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const userIdObjectId = userId instanceof mongoose.Types.ObjectId
            ? userId
            : new mongoose.Types.ObjectId(userId);
        
        const budgets = await Budget.find({ user: userIdObjectId });

        const budgetsWithSpent = await Promise.all(
            budgets.map(async (b) => {
                // Start of month: b.month is 1-12, convert to 0-indexed for JS Date
                const startDate = new Date(b.year, b.month - 1, 1);
                // End of month: b.month converted to 0-indexed, then +1 to get next month, then day 0 = last day of current month
                const endDate = new Date(b.year, b.month, 0, 23, 59, 59, 999);

                // Calculate spent from all transactions of the same category in the budget month/year
                const result = await IncomeExpense.aggregate([
                    {
                        $match: {
                            user: userIdObjectId,
                            category: b.category,
                            isIncome: false,
                            isDeleted: false,
                            addedOn: { $gte: startDate, $lte: endDate },
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalSpent: { $sum: "$cost" }
                        }
                    }
                ]);

                const spent = result[0]?.totalSpent || 0;

                return {
                    ...b.toObject(),
                    spent,
                    remaining: b.amount - spent,
                    spentPercentage: b.amount > 0 ? Math.min((spent / b.amount) * 100, 100) : 0
                };
            })
        );

        res.status(200).json(budgetsWithSpent);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

const updateBudget = async (req, res) => {
    try {
        const { category, amount, month, year } = req.body;
        const budget = await Budget.findOne({ _id: req.params.id, user: req.user.id });
        
        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        budget.category = category || budget.category;
        budget.amount = amount !== undefined ? amount : budget.amount;
        budget.month = month || budget.month;
        budget.year = year || budget.year;

        const updatedBudget = await budget.save();
        res.status(200).json(updatedBudget);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

const deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findOne({ _id: req.params.id, user: req.user.id });
        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        await budget.deleteOne();
        res.json({ message: 'Budget deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

module.exports = { createBudget, getBudgets, updateBudget, deleteBudget }
