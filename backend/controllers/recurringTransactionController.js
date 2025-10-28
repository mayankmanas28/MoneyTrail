const RecurringTransaction = require("../models/RecurringTransactions");
const { calculateNextDueDate } = require("../utils");

const createRecurringTransaction = async (req, res) => {
  const { name, category, amount, isIncome, frequency, startDate } = req.body;

  try {
    if (!name || !category || !amount || !frequency || !startDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const nextDueDate = calculateNextDueDate(startDate, frequency);

    const recurringTransaction = new RecurringTransaction({
      user: req.user.id,
      name,
      category,
      amount,
      isIncome,
      frequency,
      startDate,
      nextDueDate,
    });

    const createdRecurringTransaction = await recurringTransaction.save();
    res.status(201).json(createdRecurringTransaction);
  } catch (err) {
    console.error("Error creating recurring transaction:", err.message);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

const getRecurringTransactions = async (req, res) => {
  try {
    const transactions = await RecurringTransaction.find({ user: req.user.id });
    res.json(transactions);
  } catch (err) {
    console.error("Error fetching recurring transactions:", err.message);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

const updateRecurringTransaction = async (req, res) => {
  try {
    const { name, category, amount, isIncome, frequency, startDate } = req.body;

    // Build update data, only including fields that are provided
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (amount !== undefined) updateData.amount = amount;
    if (isIncome !== undefined) updateData.isIncome = isIncome;
    if (frequency !== undefined) updateData.frequency = frequency;
    if (startDate !== undefined) updateData.startDate = startDate;

    // Recalculate nextDueDate if startDate or frequency changes
    if (startDate !== undefined || frequency !== undefined) {
      const transaction = await RecurringTransaction.findOne({
        _id: req.params.id,
        user: req.user.id,
      });
      if (!transaction) {
        return res
          .status(404)
          .json({ message: "Recurring transaction not found" });
      }

      const newStartDate = startDate !== undefined ? startDate : transaction.startDate;
      const newFrequency = frequency || transaction.frequency;
      
      // If startDate changed, calculate from new startDate
      // Otherwise, calculate from current nextDueDate (if exists) or startDate
      const baseDate = (startDate !== undefined && startDate !== transaction.startDate) 
        ? newStartDate 
        : (transaction.nextDueDate || newStartDate);
      
      updateData.nextDueDate = calculateNextDueDate(baseDate, newFrequency);
    }

    const updated = await RecurringTransaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updateData,
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ message: "Recurring transaction not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Error updating recurring transaction:", err.message);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

const deleteRecurringTransaction = async (req, res) => {
  try {
    const deleted = await RecurringTransaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ message: "Recurring transaction not found" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Error deleting recurring transaction:", err.message);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

module.exports = {
  createRecurringTransaction,
  getRecurringTransactions,
  updateRecurringTransaction,
  deleteRecurringTransaction,
};
